import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";



const Footer = () => {
  return (
    <footer className="bg-[#05050a] text-white py-10 px-6 md:px-16 text-center">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* Left Section - Brand & Description */}
        <div>
          <h2 className="text-2xl font-bold">
            TRADIX
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xs md:max-w-full mx-auto md:mx-0">
          Your trusted space for trade insights and reflections. Start journaling with us and grow every day.

</p>
        </div>

        {/* Middle Section - Links */}
        <div className="grid grid-cols-2 gap-6 justify-center md:justify-start">
          <div>
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="mt-2 space-y-2">
              <li><Link to="/about-us" className="text-[#70757E] hover:text-white transition">About Us</Link></li>
              <li><Link to="/blog" className="text-[#70757E] hover:text-white transition">Blog</Link></li>
              <li><Link to="/contactus" className="text-[#70757E] hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="mt-2 space-y-2">
              <li><Link to="/privacy-policy" className="text-[#70757E] hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-[#70757E] hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="text-[#70757E] hover:text-white transition">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Right Section - Social Media */}
        <div>
          <h3 className="text-lg font-semibold">Follow Us</h3>
          <div className="flex justify-center md:justify-start space-x-4 mt-4">
            <a href="https://x.com/TTradix01" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-[#70757E] hover:text-white transition text-xl">
            <FaXTwitter />
            </a>
            <a href="https://www.instagram.com/wetradix/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#70757E] hover:text-white transition text-xl">
              <FaInstagram />
            </a>
            <a href="https://www.linkedin.com/in/we-tradix-591826365/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[#70757E] hover:text-white transition text-xl">
              <FaLinkedin />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61575891930517" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#70757E] hover:text-white transition text-xl">
              <FaFacebook />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-700 pt-6">
        © {new Date().getFullYear()} TRADIX. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
