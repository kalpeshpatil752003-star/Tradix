import {
  FileText,
  BarChart2,
  Tags,
  CalendarDays,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Detailed Trade Logging",
    description:
      "Attach screenshots, notes, and chart insights to each trade for deeper review.",
    icon: FileText,
  },
  {
    title: "Analytics & Visual Reports",
    description: "Spot trends in your performance using intuitive charts and graphs.",
    icon: BarChart2,
  },
  {
    title: "Smart Tagging System",
    description:
      "Organize trades with custom tags to filter and review by strategy or setup.",
    icon: Tags,
  },
  {
    title: "PnL Calendar",
    description:
      "View profits and losses over time with a calendar view, just like your dashboard.",
    icon: CalendarDays,
  },
  {
    title: "Live Win Rate Tracking",
    description:
      "Monitor your win rate, risk-reward, and trade accuracy in real-time.",
    icon: TrendingUp,
  },
  {
    title: "Private & Encrypted",
    description:
      "Your trading data stays private with bank-grade encryption.",
    icon: ShieldCheck,
  },
];

export default function FeatureSection() {
  return (
    <section className="bg-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why TRADIX?
        </motion.h2>

        <motion.p
          className="text-lg text-gray-400 mb-14 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          TRADIX is built for serious traders who want to refine their edge with every trade. Here's what makes it powerful:
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;

            // Determine entrance animation direction based on column
            const initialAnimation =
              idx % 3 === 0
                ? { x: -40, opacity: 0 } // Left column
                : idx % 3 === 1
                ? { y: -40, opacity: 0 } // Center column
                : { x: 40, opacity: 0 }; // Right column

            return (
              <motion.div
                key={idx}
                className="group bg-[#121212] p-6 rounded-2xl shadow-md border-2 border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-white"
                initial={initialAnimation}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className="flex items-center justify-center mb-5">
                  <Icon className="w-10 h-10 text-white/50 transition-transform duration-300 group-hover:scale-110 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
