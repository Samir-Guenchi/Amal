import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">أ</span>
              </div>
              <span className="font-semibold text-lg text-white">Amal</span>
            </Link>
            <p className="text-sm text-zinc-500 mb-4">
              AI-powered support for your recovery journey. Available 24/7 in Arabic, French, and Darija.
            </p>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Phone className="w-4 h-4 text-green-500" />
              <a href="tel:3033" className="hover:text-white transition-colors">3033</a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/chat" className="hover:text-white transition-colors">Start Chat</Link>
              </li>
              <li>
                <a href="tel:3033" className="hover:text-white transition-colors">Crisis Line: 3033</a>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">Resources</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-medium text-white mb-4">About</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Our Mission</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h4 className="font-medium text-white mb-4">Languages</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <button className="hover:text-white transition-colors font-arabic">العربية</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">Français</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">Darija</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">English</button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Amal. Made with hope for Algeria.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Algeria
            </span>
            <span>Built for recovery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
