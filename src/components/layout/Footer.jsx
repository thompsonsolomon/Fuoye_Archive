import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="bg-emerald-800 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-emerald-800 font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-xl">FUOYE Archive</span>
            </div>
            <p className="text-emerald-100 mb-4">
              Connecting the Federal University Oye-Ekiti community through shared stories and opportunities.
            </p>
            <div className="text-emerald-200 text-sm">© 2024 Federal University Oye-Ekiti. All rights reserved.</div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2 text-emerald-100">
              <Link to="/blog" className="block hover:text-white transition-colors">
                Blog
              </Link>
              <Link to="/reels" className="block hover:text-white transition-colors">
                Reels
              </Link>
              <Link to="/marketplace" className="block hover:text-white transition-colors">
                Marketplace
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-emerald-100 text-sm">
              <p>Smartdev Forge</p>
              <Link to="mailto:smartdevforge@gmail.com"><p>contact@smartdevforge</p></Link>
              <Link to="tel:+2348141342103"><p>(234) 814-134-2103</p></Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
