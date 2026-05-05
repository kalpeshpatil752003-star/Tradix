import { validationResult } from 'express-validator';
import TradeDetails from "../models/tradeDetails.js";
import TradeAddDetails from '../models/tradeAddDetails.js';
import { CalculateHandleJournal, CalculateTradeStats } from '../utils/calculate.js';
import TradeStats from '../models/tradeStats.js';
import TradeJournal from '../models/tradeJournal.js';
import { DateRangeFilter } from '../utils/general.js';
import Accounts from '../models/accounts.js';
import { AddUpdateTradeStats } from './tradeStats.js';
import { AddTradeJournal } from './tradeJournal.js';
import { decrypt } from '../helpers/main.js';
import { calculateFeesByExchange } from '../helpers/fees.js';

const toNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

const recalculateJournalAfterDelete = async ({ journal, UserId, AccountId, TradeId, account }) => {
    if (!journal) return;

    const remainingTradeIds = (journal.TradeIds || []).filter(id => Number(id) !== Number(TradeId));

    if (remainingTradeIds.length === 0) {
        await TradeJournal.deleteOne({ UserId, AccountId, JournalId: journal.JournalId });
        return;
    }

    const remainingStats = await TradeStats.find({
        UserId,
        AccountId,
        TradeId: { $in: remainingTradeIds }
    });

    if (remainingStats.length === 0) {
        await TradeJournal.deleteOne({ UserId, AccountId, JournalId: journal.JournalId });
        return;
    }

    const totalNetPnL = remainingStats.reduce((sum, trade) => sum + toNumber(trade.NetPnL), 0);
    const totalGrossPnL = remainingStats.reduce((sum, trade) => sum + toNumber(trade.GrossPnL), 0);
    const totalFees = remainingStats.reduce((sum, trade) => sum + toNumber(trade.TotalFees), 0);
    const totalRR = remainingStats.reduce((sum, trade) => sum + toNumber(trade.RiskReward), 0);
    const totalWins = remainingStats.filter(trade => trade.TradeStatus === "WIN").length;
    const totalLoss = remainingStats.filter(trade => trade.TradeStatus === "LOSS").length;
    const initialBalance = toNumber(account?.InitialBalance);

    await TradeJournal.updateOne(
        { UserId, AccountId, JournalId: journal.JournalId },
        {
            $set: {
                TradeIds: remainingTradeIds,
                TotalNetPnL: Number(totalNetPnL.toFixed(2)),
                TotalTrades: remainingStats.length,
                TradeStatus: totalNetPnL > 0 ? "PROFIT" : totalNetPnL < 0 ? "LOSS" : "BREAKEVEN",
                TotalWins: totalWins,
                TotalLoss: totalLoss,
                Winrate: Number(((totalWins / remainingStats.length) * 100).toFixed(2)),
                TotalFees: Number(totalFees.toFixed(2)),
                TotalGrossPnL: Number(totalGrossPnL.toFixed(2)),
                TotalRR: Number(totalRR.toFixed(2)),
                NetRevenue: Number(totalNetPnL.toFixed(2)),
                GrossRevenue: Number((initialBalance + totalGrossPnL).toFixed(2)),
                TotalRevenue: Number((initialBalance + totalNetPnL).toFixed(2)),
                TotalRoi: initialBalance ? Number(((totalNetPnL / initialBalance) * 100).toFixed(2)) : 0,
                UpdatedBy: UserId
            }
        }
    );
};

/* Inserting/Updating TradeDetails */
export const AddUpdateTrade = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    else {
        try {
            const { Market, Broker, Setup, TradeStatus, Action, Symbol, EntryDate, ExitDate,
                EntryPrice, ExitPrice, Fees: total_fees, StopLoss, Quantity, EntryReason, ExitReason,
                Emotions, MarketConditions, AdditionalInformation, UserId: user_id = null, AccountId: account_id = null, TradeId = 0, IsImport = false } = req.body;
            const { accountId, userId } = req.params;

            let UserId = user_id == null ? decrypt(userId) : user_id, AccountId = account_id == null ? decrypt(accountId) : account_id;
            req.body.UserId = UserId;
            req.body.AccountId = AccountId;
            
            let Fees = total_fees == "" || total_fees == undefined ? calculateFeesByExchange(Broker, EntryPrice, ExitPrice, Quantity) : total_fees;
            req.body.Fees = Fees;

            const accountDetails = await Accounts.findOne({ AccountId });

            if (!accountDetails) return res.status(400).json({
                success: false,
                error: "Account Not Found! Please go to Settings and create account"
            });

            //Checking the records exists or not
            const tradeDetails = await TradeDetails.findOne({ UserId, AccountId, TradeId });
            const TradeName = Symbol + " " + Action;

            //If record exists Update Trade
            if (tradeDetails) {
                const updateTrade = await TradeDetails.findOneAndUpdate(
                    { UserId, AccountId, TradeId },
                    { TradeName, Market, Broker, Setup, TradeStatus, Action, Symbol, EntryDate, ExitDate, EntryPrice, ExitPrice, StopLoss, Quantity, AccountId, UpdatedBy: UserId },
                    { new: true }
                );

                if (!updateTrade) {
                    res.status(400).json({
                        success: false,
                        error: "Oops Something Went! Unable to Update Trade"
                    });
                }
                else {
                    req.body.TradeState = true; //If true means updated
                }
            }
            //Else Insert New Trade
            else {
                // Find the last Id from Collection. If record does'nt exist, start with 1, otherwise increment the last Id
                let lastId = await TradeDetails.findOne().sort('-TradeId');
                const TradeId = lastId ? lastId.TradeId + 1 : 1;

                const newTrade = new TradeDetails({ TradeId, TradeName, Market, Broker, Setup, TradeStatus, Action, Symbol, EntryDate, ExitDate, EntryPrice, ExitPrice, StopLoss, Quantity, AccountId, UserId, CreatedBy: UserId });

                const trade = await newTrade.save();
                if (!trade) {
                    res.status(400).json({
                        success: true,
                        error: "Oops Something Went! Unable to Insert Trade"
                    });
                }
                else {
                    req.body.TradeId = trade.TradeId;
                    req.body.TradeState = false; //If false means new trade added
                }
            }

            //If any field had the value then insert data in TradeAddDetails
            if (EntryReason || ExitReason || Emotions || MarketConditions || AdditionalInformation) {
                if (!AddUpdateTradeAddDetails(req)) {
                    res.status(400).json({
                        success: true,
                        error: "Oops Something Went Wrong! Unable to Update Trade"
                    });
                }
            }

            //Calculate Stats only if tradeStatus is Closed
            if (TradeStatus === "Closed") {
                req.body.Stats = await CalculateTradeStats(Action, EntryPrice, ExitPrice, StopLoss, Quantity, Fees, AccountId);

                if (IsImport) {
                    await AddUpdateTradeStats(req, res, next);
                    await AddTradeJournal(req, res, next);
                    return true;
                }
                next();
            }
            else {
                return res.status(201).json({
                    success: true,
                    message: "Trade " + (req.body?.TradeState ? "Updated" : "Added") + " Successfully!!!"
                });
            }
        }
        catch (err) {
            return;
        }
    }
};

/* Inserting/Updating TradeAddDetails */
const AddUpdateTradeAddDetails = async (req) => {
    const { TradeId, UserId, AccountId, EntryReason, ExitReason, Emotions, MarketCondition, TradeAddInfo } = req.body;

    const tradeAddDetails = await TradeAddDetails.findOne({ UserId, AccountId, TradeId });
    if (tradeAddDetails) {
        const updateTrade = await TradeAddDetails.findOneAndUpdate(
            { UserId, AccountId, TradeId },
            { EntryReason, ExitReason, Emotions, MarketCondition, TradeAddInfo, AccountId, UpdatedBy: UserId },
            { new: true }
        );

        if (updateTrade) {
            return updateTrade;
        }
    }
    else {
        // Find the last Id from Collection. If record does'nt exist, start with 1, otherwise increment the last Id
        let lastId = await TradeAddDetails.findOne().sort('-TradeAddId');
        const TradeAddId = lastId ? lastId.TradeAddId + 1 : 1;

        const newTrade = new TradeAddDetails({ TradeAddId, EntryReason, ExitReason, Emotions, MarketCondition, TradeAddInfo, TradeId, AccountId, UserId, CreatedBy: UserId });

        const tradeDetails = await newTrade.save();
        if (tradeDetails) {
            return tradeDetails;
        }
    }
};

/* Getting all Trade Data & Statistics */
export const getTradeData = async (req, res) => {

    const { id: tradeId } = req.query;

    let FilterName = "EntryDate";
    const tradeFilter = DateRangeFilter(req, FilterName);

    //Filter for fetching TradeDetails to show in Daily Trade Journal.
    const { TradeId } = req.body;
    if (TradeId) tradeFilter.TradeId = { $in: TradeId };

    if (tradeId) tradeFilter.TradeId = parseInt(tradeId);

    const getTrade = await TradeDetails.aggregate([
        { $match: tradeFilter },
        {
            $lookup: {
                from: "TradeAddDetails",
                localField: "TradeId",
                foreignField: "TradeId",
                as: "TradeAddDetails",
            },
        },
        {
            $lookup: {
                from: "TradeStats",
                localField: "TradeId",
                foreignField: "TradeId",
                as: "TradeStats"
            },
        },
        { $unwind: { path: "$TradeAddDetails", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$TradeStats", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                "_id": 0,
                "TradeId": 1,
                "TradeName": 1,
                "Symbol": 1,
                "EntryDate": 1,
                "ExitDate": 1,
                "Action": 1,
                "EntryPrice": 1,
                "ExitPrice": 1,
                "StopLoss": 1,
                "Quantity": 1,
                "Setup": 1,
                "EntryReason": "$TradeAddDetails.EntryReason",
                "ExitReason": "$TradeAddDetails.ExitReason",
                "MarketCondition": "$TradeAddDetails.MarketCondition",
                "Emotions": "$TradeAddDetails.Emotions",
                "AdditionalInfo": "$TradeAddDetails.TradeAddInfo",
                "TradeStatus": "$TradeStats.TradeStatus",
                "NetPnL": "$TradeStats.NetPnL",
                "GrossPnL": "$TradeStats.GrossPnL",
                "NetRoi": "$TradeStats.NetRoi",
                "Fees": "$TradeStats.TotalFees",
                "TradeRisk": "$TradeStats.TradeRisk",
                "RiskReward": "$TradeStats.RiskReward",
            }
        },
    ]).sort({ EntryDate: 1 });

    //Return All Trades to GetTradeJournal function.
    if (TradeId) {
        return getTrade;
    }
    else {

        let previousTrade, nextTrade;
        if (tradeId) {
            //Deleting tradeId from filter because we want prev & next tradeId
            delete tradeFilter.TradeId;

            //Below code is for getting previous & next tradeId based on actual tradeId using index
            const tradeDetail = await TradeDetails.find(tradeFilter).sort({ EntryDate: 1 });
            const currentIndex = tradeDetail.findIndex(trade => trade.TradeId === parseInt(tradeId));
            previousTrade = currentIndex > 0 ? tradeDetail[currentIndex - 1] : null;
            nextTrade = currentIndex < tradeDetail.length - 1 ? tradeDetail[currentIndex + 1] : null;
        }

        return res.status(200).json({
            success: true,
            tradeDetails: tradeId ? {
                ...getTrade[0],
                previousTradeId: previousTrade?.TradeId,
                nextTradeId: nextTrade?.TradeId
            } : getTrade,
        });

    }
};

/* Getting all Trade Data for Update Operation */
export const getTradeDetails = async (req, res) => {

    //For update operation filter by TradeId
    const { UserId } = req.body;
    const TradeId = parseInt(req.params?.id || 0);

    const getTrade = await TradeDetails.aggregate([
        { $match: { UserId, TradeId } },
        {
            $lookup: {
                from: "TradeAddDetails",
                localField: "TradeId",
                foreignField: "TradeId",
                as: "TradeAddDetails",
            },
        },
        {
            $lookup: {
                from: "TradeStats",
                localField: "TradeId",
                foreignField: "TradeId",
                as: "TradeStats"
            },
        },
        { $unwind: { path: "$TradeAddDetails", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$TradeStats", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                "_id": 0,
                "Market": 1,
                "Broker": 1,
                "Setup": 1,
                "TradeStatus": 1,
                "Action": 1,
                "Symbol": 1,
                "EntryDate": 1,
                "ExitDate": 1,
                "EntryPrice": 1,
                "ExitPrice": 1,
                "StopLoss": 1,
                "Quantity": 1,
                "AccountId": 1,
                "Fees": "$TradeStats.TotalFees",
                "EntryReason": "$TradeAddDetails.EntryReason",
                "ExitReason": "$TradeAddDetails.ExitReason",
                "Emotions": "$TradeAddDetails.Emotions",
                "MarketCondition": "$TradeAddDetails.MarketCondition",
                "AdditionalInfo": "$TradeAddDetails.TradeAddInfo",
            }
        },
        {
            $addFields: {
                Account: "$AccountId"
            }
        },
        {
            $project: {
                "AccountId": 0
            }
        }
    ]);

    return res.status(200).json({
        success: true,
        tradeDetails: { ...getTrade[0] }
    });
};

/* For Dashboard Fetch Recent Trade */
export const GetRecentTrade = async (req, res) => {
    const getTrade = await TradeDetails.aggregate([
        { $match: DateRangeFilter(req, "EntryDate") },
        {
            $lookup: {
                from: "TradeStats",
                localField: "TradeId",
                foreignField: "TradeId",
                as: "TradeStats"
            },
        },
        { $sort: { _id: -1 } },
        { $limit: 4 },
        { $unwind: { path: "$TradeStats", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                "_id": 0,
                "TradeId": 1,
                "Symbol": 1,
                "EntryDate": 1,
                "ExitDate": 1,
                "Action": 1,
                "TradeStatus": "$TradeStats.TradeStatus",
                "NetPnL": "$TradeStats.NetPnL",
                "NetRoi": "$TradeStats.NetRoi",
            }
        }
    ]);
    return res.status(200).json({
        success: true,
        tradeDetails: getTrade
    });
}

/* Deleting Trade */
export const DeleteTrades = async (req, res) => {
    const { AccountId, UserId, TradeId } = req.body;

    const tradeFilter = { UserId, AccountId };

    /* If TradeId Exists delete single trade */
    if (TradeId) {
        tradeFilter.TradeId = TradeId;
    }
    //Fetching Data Updating the TradeStats & Journal
    const tradeDetail = await TradeDetails.findOne(tradeFilter);
    const tradeStats = await TradeStats.findOne(tradeFilter);
    const account = await Accounts.findOne({ UserId, AccountId });
    const journal = TradeId ? await TradeJournal.findOne({ UserId, AccountId, "TradeIds": TradeId }) : null;

    if (TradeId && !tradeDetail) {
        return res.status(404).json({
            success: false,
            message: "Trade not found"
        });
    }

    const prevNetPnl = toNumber(tradeStats?.NetPnL);
    const balanceAdjustment = -prevNetPnl;

    await TradeDetails.deleteMany(tradeFilter);
    await TradeAddDetails.deleteMany(tradeFilter);
    await TradeStats.deleteMany(tradeFilter);

    if (TradeId) {
        if (account && balanceAdjustment !== 0) {
            await Accounts.updateOne(
                { UserId, AccountId },
                { $inc: { TotalBalance: balanceAdjustment } }
            );
        }

        await recalculateJournalAfterDelete({ journal, UserId, AccountId, TradeId, account });

        return res.status(200).send({
            success: true,
            message: "Trade Deleted Successfully!!!"
        });
    }
    else {
        await TradeJournal.deleteMany(tradeFilter);
        if (account) {
            await Accounts.updateOne(
                { UserId, AccountId },
                { TotalBalance: account.InitialBalance }
            );
        }
        return true;
    }

}
