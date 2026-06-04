import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../lib/useCart'
import { useAuth } from '../lib/useAuth'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { logout, session, profile, supabaseReady } = useAuth()
  const cart = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function signOut() {
    const confirmed = window.confirm('Are you sure you want to sign out?')
    if (!confirmed) return

    logout()
    navigate('/')
  }

  function search(event) {
    event.preventDefault()
    const q = new FormData(event.currentTarget).get('q')
    navigate(`/products${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }

  const username = profile?.full_name || session?.user?.email?.split('@')[0] || 'Customer'
  const initial = username.slice(0, 1).toUpperCase()
  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <nav id="main-navbar" className={`sticky top-0 z-50 bg-[#fffaf0]/90 backdrop-blur-md border-b border-brand-100 transition-all duration-300 ${scrolled ? 'shadow-md shadow-brand-900/10' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <img src="/rjn-logo.png" alt="RJN logo" className="w-10 h-10 rounded-full bg-brand-900 border border-brand-300 object-contain p-1 shadow-sm transition-all duration-300 group-hover:scale-105" />
              <span className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">RJN<span className="text-brand-500">.</span></span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={search} className="relative w-full group">
                <input type="text" name="q" placeholder="Search products..." className="w-full bg-white border border-brand-100 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 transition-all duration-300 group-hover:bg-brand-50" />
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs transition-colors group-focus-within:text-brand-500"></i>
              </form>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-4">
                <NavItem to="/">Home</NavItem>
                <NavItem to="/products">Explore</NavItem>
                <NavItem to="/cart">Cart</NavItem>
                <NavItem to="/bulk-order">Bulk Orders</NavItem>
              </div>

              <div className="h-4 w-px bg-gray-200"></div>

              {session ? (
                <div className="relative" id="profileDropdown">
                  <button onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-full transition-all duration-200">
                    <div className="w-8 h-8 bg-brand-900 text-brand-100 rounded-full flex items-center justify-center text-xs font-bold border border-brand-300 shadow-sm">
                      {initial}
                    </div>
                    <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 mr-1 transition-transform ${profileOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  <div className={`${profileOpen ? 'block animate-dropdown' : 'hidden'} absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden`}>
                    <div className="px-4 py-3 bg-brand-50/70 border-b border-brand-100 mb-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{username}</p>
                    </div>
                    <div className="px-2 space-y-1">
                      <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-brand-50 hover:text-brand-600 transition-all">
                        <i className="fa-solid fa-layer-group text-gray-400"></i> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-brand-50 hover:text-brand-600 transition-all">
                        <i className="fa-solid fa-user text-gray-400"></i> Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-brand-50 hover:text-brand-600 transition-all">
                        <i className="fa-solid fa-bag-shopping text-gray-400"></i> Orders
                      </Link>
                      {isAdmin ? (
                        <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-brand-50 hover:text-brand-600 transition-all">
                          <i className="fa-solid fa-chart-line text-gray-400"></i> Admin
                        </Link>
                      ) : null}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 px-2">
                      <button onClick={signOut} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50 transition-all">
                        <i className="fa-solid fa-power-off"></i> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/auth" className="text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors">{supabaseReady ? 'Login' : 'Connect Supabase'}</Link>
                  <Link to="/cart" className="relative text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">
                    <i className="fa-solid fa-cart-shopping"></i>
                    {cart?.count ? <span className="absolute -top-3 -right-3 w-5 h-5 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center">{cart.count}</span> : null}
                  </Link>
                  <Link to="/auth?mode=signup" className="px-5 py-2 text-sm font-bold text-brand-50 bg-brand-900 rounded-full hover:bg-brand-800 shadow-md shadow-brand-900/20 transition-all active:scale-95">Get Started</Link>
                </div>
              )}
            </div>

            <button onClick={() => setMobileOpen((value) => !value)} className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-lg`}></i>
            </button>
          </div>
        </div>

        <div className={`${mobileOpen ? 'block animate-fade-in' : 'hidden'} md:hidden border-t border-brand-100 bg-[#fffaf0]`}>
          <div className="px-4 py-4 space-y-2">
            <form onSubmit={search} className="relative mb-4">
              <input type="text" name="q" placeholder="Search..." className="w-full bg-white border border-brand-100 rounded-xl py-3 pl-12 text-sm focus:ring-brand-500/20" />
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </form>
            <MobileLink to="/">Home</MobileLink>
            <MobileLink to="/products">Explore</MobileLink>
            <MobileLink to="/cart">Cart {cart?.count ? `(${cart.count})` : ''}</MobileLink>
            <MobileLink to="/bulk-order">Bulk Orders</MobileLink>
            <MobileLink to="/contact">Contact Us</MobileLink>
            {session ? (
              <div className="pt-4 border-t border-gray-100">
                <div className="px-4 py-2 mb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">My Account</p>
                </div>
                <MobileLink to="/dashboard">Dashboard</MobileLink>
                <MobileLink to="/profile">Profile</MobileLink>
                <MobileLink to="/orders">Orders</MobileLink>
                {isAdmin ? <MobileLink to="/admin">Admin</MobileLink> : null}
                <button onClick={signOut} className="block w-full text-left px-4 py-3 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50">Logout</button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      <main className="min-h-[calc(100vh-300px)]">
        <Outlet />
      </main>

      <footer className="bg-brand-900 text-gray-300 pt-16 pb-8 border-t border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-3 mb-6">
                <img src="/rjn-logo.png" alt="RJN logo" className="w-10 h-10 rounded-full bg-brand-900 border border-brand-300 object-contain p-1" />
                <span className="text-xl font-bold text-white">RJN<span className="text-brand-300">.</span></span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">Premium groceries, kitchen essentials, and wholesale supplies with RJN quality.</p>
            </div>
            <FooterColumn title="Foods Store" links={[['All Products', '/products'], ['Bulk Orders', '/bulk-order'], ['Contact RJN', '/contact']]} />
            <FooterColumn title="Support" links={[['Contact Us', '/contact'], ['Bulk Orders', '/bulk-order'], ['About Us', '/']]} />
            <div>
              <h4 className="text-white font-bold mb-6">Connect</h4>
              <p className="text-sm text-gray-400 mb-4">Follow us on social media for updates and offers.</p>
              <div className="flex gap-4 text-gray-400">
                <a href="#" className="hover:text-white transition-colors text-lg"><i className="fa-brands fa-twitter"></i></a>
                <a href="#" className="hover:text-white transition-colors text-lg"><i className="fa-brands fa-facebook"></i></a>
                <a href="#" className="hover:text-white transition-colors text-lg"><i className="fa-brands fa-instagram"></i></a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} RJN Foods. All rights reserved.</p>
            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-twitter"></i></a>
              <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-facebook"></i></a>
              <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

function NavItem({ children, to }) {
  return (
    <NavLink to={to} className={({ isActive }) => `text-sm font-medium transition-all duration-200 ${isActive ? 'text-brand-600' : 'text-gray-500 hover:text-brand-600'}`}>
      {children}
    </NavLink>
  )
}

function MobileLink({ children, to }) {
  return <Link to={to} className="block px-4 py-3 text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-50">{children}</Link>
}

function FooterColumn({ links, title }) {
  return (
    <div>
      <h4 className="text-white font-bold mb-6">{title}</h4>
      <ul className="space-y-4 text-sm">
        {links.map(([label, to]) => (
          <li key={label}><Link to={to} className="hover:text-brand-400 transition-colors">{label}</Link></li>
        ))}
      </ul>
    </div>
  )
}
