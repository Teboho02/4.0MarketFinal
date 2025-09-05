import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Shop Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/category/laptops" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Laptops
                </Link>
              </li>
              <li>
                <Link 
                  to="/category/smartphones" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Smartphones
                </Link>
              </li>
              <li>
                <Link 
                  to="/category/gaming" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Gaming
                </Link>
              </li>
              <li>
                <Link 
                  to="/category/accessories" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Support</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/contact" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="/returns" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Returns
                </a>
              </li>
              <li>
                <a 
                  href="/warranty" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Warranty
                </a>
              </li>
              <li>
                <a 
                  href="/faqs" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/privacy-policy" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms-of-service" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="/shipping" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Shipping
                </a>
              </li>
              <li>
                <a 
                  href="/returns" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Returns
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            &copy; 2025 Bazara Tech Market. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;