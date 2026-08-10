import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, Minus, Plus, X, GraduationCap, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import '../../styles.css'

const videoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4'
const links = ['Features', 'For Students', 'For Universities', 'Pricing', 'FAQ']

const faqs = [
  ['What can I plan with Univo?', 'Organize attendance, assignments, notes, and your entire campus life — individually or through your university workspace.'],
  ['Can universities subscribe?', 'Yes. Universities get isolated workspaces with admin, teacher, and student roles — timetable, grading, and analytics included.'],
  ['How do individual students join?', 'Sign up directly for a personal dashboard with self-tracked attendance, notes, marketplace, forum, and messenger.'],
  ['How do university students join?', 'Via invite link or official email domain (@xyzuniversity.edu) with admin approval.'],
  ['Is Univo free to get started?', 'Individual accounts are free. University plans are priced per campus — contact us for a demo.'],
]

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Return to Univo home">
      <svg className="logoMark" viewBox="0 0 40 32" aria-hidden="true">
        <path className="capTop" d="M2 11.5 20 3l18 8.5L20 20 2 11.5Z" />
        <path className="capBase" d="M9 15.5v6.2c0 3.3 4.9 6.3 11 6.3s11-3 11-6.3v-6.2l-11 5.2-11-5.2Z" />
        <path className="capLine" d="M35 13v8" />
        <circle className="capDot" cx="35" cy="23" r="1.8" />
      </svg>
      <span>Univo</span>
    </Link>
  )
}

function FAQSection() {
  const [active, setActive] = useState(null)
  return (
    <section className="faqSection" id="faq">
      <div className="faqIntro">
        <span className="eyebrow">Frequently asked questions</span>
        <h2>Everything you need to know.</h2>
        <p>Clear answers for a clearer college journey.</p>
      </div>
      <div className="faqList">
        {faqs.map(([question, answer], index) => (
          <div className={`faqItem ${active === index ? 'active' : ''}`} key={question}>
            <button className="faqQuestion" type="button" onClick={() => setActive(active === index ? null : index)}>
              <span className="faqIndex">{String(index + 1).padStart(2, '0')}</span>
              <span>{question}</span>
              {active === index ? <Minus size={20} /> : <Plus size={20} />}
            </button>
            {active === index && <div className="faqAnswer"><p>{answer}</p></div>}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function LandingPage() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard/me')
  }, [isAuthenticated, navigate])

  return (
    <>
      <section className="hero" id="top">
        <video className="video" autoPlay loop muted playsInline src={videoUrl} />
        <div className="content">
          <nav className="nav">
            <Logo />
            <div className="desktopNav">
              <div className="navPill">
                {links.map((link) => (
                  <a key={link} href={link === 'FAQ' ? '#faq' : link === 'Features' ? '#features' : '#'} className="navLink">
                    {link}{link === 'For Universities' && <ChevronDown size={14} />}
                  </a>
                ))}
              </div>
            </div>
            <Link to="/login" className="cta desktopCta">Log in</Link>
            <button className="menuButton" type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
              <Menu className={open ? 'icon hiddenIcon' : 'icon'} size={22} />
              <X className={open ? 'icon' : 'icon hiddenIcon'} size={22} />
            </button>
          </nav>

          <div className={`backdrop ${open ? 'shown' : ''}`} onClick={() => setOpen(false)} />
          <aside className={`drawer ${open ? 'open' : ''}`}>
            <div className="drawerLinks">
              {links.map((link, i) => (
                <a href={link === 'FAQ' ? '#faq' : '#'} key={link} onClick={() => setOpen(false)} style={{ transitionDelay: open ? `${(i + 1) * 60}ms` : '0ms' }}>
                  {link}{link === 'For Universities' && <ChevronDown size={18} />}
                </a>
              ))}
            </div>
            <Link to="/login" className="cta drawerCta" onClick={() => setOpen(false)}>Log in</Link>
          </aside>

          <main className="main">
            <div className="copy">
              <h1>Your campus life,<br />finally in one place.</h1>
              <p className="heroSub">Plan, track, connect — whether you're flying solo or part of a university workspace.</p>

              {/* Dual entry points */}
              <div className="entryPoints">
                <Link to="/login?path=student" className="entryCard entryStudent">
                  <GraduationCap size={22} />
                  <div>
                    <strong>I'm a Student</strong>
                    <span>Personal dashboard · Notes · Community</span>
                  </div>
                </Link>
                <Link to="/login?path=university" className="entryCard entryUniversity">
                  <Building2 size={22} />
                  <div>
                    <strong>I'm a University</strong>
                    <span>Admin · Teachers · Campus workspace</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="cards">
              <div className="card stats">
                <div className="statNumber">2.8K+</div>
                <p>Students across individual and institutional plans use Univo daily.</p>
              </div>
              <div className="card testimonial">
                <div className="company"><span className="companyMark">U</span><span>Univo Students</span></div>
                <p className="quote">"Finally an app that feels like Linear, not a college project spreadsheet."</p>
                <div className="person">
                  <img src="https://i.pravatar.cc/72?img=12" alt="Siddharth Agarwal" />
                  <div><strong>Siddharth Agarwal</strong><span>CS · Semester 4</span></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>

      <section className="infoSection featuresSection" id="features">
        <div className="sectionIntro">
          <span className="eyebrow">Two paths, one platform</span>
          <h2>Individual freedom.<br />Institutional power.</h2>
          <p>Path A for solo students. Path B for universities with isolated workspaces, RBAC, and real teacher workflows.</p>
        </div>
        <div className="featureGrid">
          <article><span className="featureNumber">A</span><h3>Individual Student</h3><p>Self-tracked attendance, personal notes, assignments, marketplace, forum, confessions, and messenger.</p></article>
          <article><span className="featureNumber">B</span><h3>Institutional Plan</h3><p>Isolated workspace per university — admin command center, teacher grading queues, student timetables.</p></article>
          <article><span className="featureNumber">∞</span><h3>Shared Community</h3><p>Notes Hub, Marketplace, Forum, and Confession Board connect everyone across both tiers.</p></article>
        </div>
      </section>

      <section className="infoSection processSection">
        <div className="processCopy">
          <span className="eyebrow">Built different</span>
          <h2>Startup polish.<br />Not a student project.</h2>
          <p>Glassmorphism, magnetic nav, command palette, theme switcher, skeleton loaders, and motion everywhere.</p>
          <Link to="/login?path=student" className="darkButton">Try the demo</Link>
        </div>
        <div className="steps">
          <div><span>1</span><p><strong>Sign up</strong><br />Two clear entry points — student or university.</p></div>
          <div><span>2</span><p><strong>Get routed</strong><br />One login form, role-based redirect to your dashboard.</p></div>
          <div><span>3</span><p><strong>Thrive</strong><br />Track, connect, and actually enjoy your semester.</p></div>
        </div>
      </section>

      <FAQSection />

      <footer className="footer">
        <div className="footerTop">
          <div className="footerBrand">
            <Logo />
            <p>Your campus companion — dark, premium, and built for the way students actually live.</p>
            <Link to="/login?path=student" className="footerLogin">Get started free</Link>
          </div>
          <div className="footerColumn"><span className="footerHeading">Product</span><a href="#top">Home</a><a href="#faq">FAQ</a><a href="#features">Features</a></div>
          <div className="footerColumn"><span className="footerHeading">For students</span><Link to="/login?path=student">Individual plan</Link><Link to="/login?path=student">Notes Hub</Link><Link to="/login?path=student">Marketplace</Link></div>
          <div className="footerColumn"><span className="footerHeading">For universities</span><Link to="/login?path=university">Institutional plan</Link><a href="mailto:hello@univo.app">Contact sales</a></div>
        </div>
        <div className="footerBottom">
          <span>© 2026 Univo. Built for students.</span>
          <span className="statusPill"><i /> All systems operational</span>
        </div>
      </footer>
    </>
  )
}
