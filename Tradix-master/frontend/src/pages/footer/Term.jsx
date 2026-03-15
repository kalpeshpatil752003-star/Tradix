import Footer from "components/landing/Footer";
import Navbar from "components/landing/Navbar";
import React from "react";
const Term= () => {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-black text-white px-6 md:px-12 py-20 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-white/90">
            Terms of Service
          </h1>

          <p className="mb-6 text-white/55 leading-relaxed">
            Note: We actively solicit feedback on our terms of service; please send any comments or questions to support@tradix.com
          </p>

          <h2 className="text-2xl font-semibold text-white mb-4">1. User's Acknowledgment and Acceptance of Terms</h2>
          <p className="mb-6 text-white/55 leading-relaxed">
            Tradix LLC ("Tradix", "Us", or "We") provides the Tradix site and various related services (collectively, the "site") to you, the user, subject to your compliance with all the terms, conditions, and notices contained or referenced herein (the "Terms of Service"), as well as any other written agreement between us and you. In addition, when using particular services or materials on this site, users shall be subject to any posted rules applicable to such services or materials that may contain terms and conditions in addition to those in these Terms of Service. All such guidelines or rules are hereby incorporated by reference into these Terms of Service.
          </p>
          
          <p className="mb-6 text-white/55 leading-relaxed">
            BY USING THIS SITE, YOU AGREE TO BE BOUND BY THESE TERMS OF SERVICE. IF YOU DO NOT WISH TO BE BOUND BY THESE TERMS OF SERVICE, PLEASE EXIT THE SITE NOW. YOUR REMEDY FOR DISSATISFACTION WITH THIS SITE, OR ANY PRODUCTS, SERVICES, CONTENT, OR OTHER INFORMATION AVAILABLE ON OR THROUGH THIS SITE, IS TO STOP USING THE SITE AND/OR THOSE PARTICULAR PRODUCTS OR SERVICES.
          </p>
          
          <h2 className="text-2xl font-semibold  mb-4">2. Description of Services</h2>
          <p className="mb-6 text-white/55 leading-relaxed">
            We make various services available on this site, including, but not limited to, trade journaling, trade analysis, sharing or publishing of trades, and other like services. You are responsible for providing, at your own expense, all equipment necessary to use the services, including a computer and Internet access (including payment of all fees associated with such access).
          </p>
          
          <h2 className="text-2xl font-semibold  mb-4">3. Registration Data and Privacy</h2>
          <p className="mb-6 text-white/55 leading-relaxed">
            In order to access some of the services on this site, you will be required to use an account and password that can be obtained by completing our online registration form, which requests certain information and data, and maintaining and updating your Registration Data as required.
          </p>
          
          <h2 className="text-2xl font-semibold  mb-4">4. Conduct on Site</h2>
          <p className="mb-6 text-white/55 leading-relaxed">
            Your use of the site is subject to all applicable laws and regulations, and you are solely responsible for the substance of your communications through the site. By posting information in or otherwise using any communications service, chat room, message board, newsgroup, software library, or other interactive service that may be available to you on or through this site, you agree that you will not upload, share, post, or otherwise distribute or facilitate distribution of any content.
          </p>

          <h2 className="text-2xl font-semibold  mb-4">5. Subscriptions</h2>
          <p className="mb-6 text-white/55 leading-relaxed">
            Subscriptions are sold on this site, and are generally paid in advance to receive the service.
          </p>

          <h2 className="text-2xl font-semibold  mb-4">6. Third Party Sites and Information</h2>
          <p className="mb-6 text-white/55 leading-relaxed">
            This site may link you to other sites on the Internet or otherwise include references to information, documents, software, materials, and/or services provided by other parties. These sites may contain information or material that some people may find inappropriate or offensive.
          </p>

        </div>
      </div>

      <Footer/>
    </>
  );
};

export default Term;
