import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, Menu, X, GraduationCap, Building2, Sparkles, Layers, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import LoginPage from '../auth/LoginPage'
import TextLoop from '../../components/ui/TextLoop'
import TestimonialMarquee from '../../components/ui/TestimonialMarquee'
import '../../styles.css'
import SiteFooter from '../../components/layout/SiteFooter'

const videoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4'
const links = ['Features', 'For Students', 'For Universities', 'Pricing', 'FAQ']

const faqs = [
  ['What makes this platform different?', 'Univo brings planning, campus communities, and university workflows into one focused experience designed around real student life.'],
  ['Can I use it for both personal and commercial projects?', 'Yes. Individual students can use Univo personally, while universities can set up dedicated workspaces for their campus community.'],
  ['Does it support collaboration?', 'Yes. Shared workspaces, community tools, and role-based access make it easy for students, teachers, and administrators to work together.'],
  ['How does the analytics system work?', 'University teams can view privacy-conscious engagement and workflow insights to understand how their campus workspace is being used.'],
  ['Is there a mobile version available?', 'The platform is designed to work smoothly across desktop and mobile browsers, so you can stay on top of campus life anywhere.'],
  ['How often are new updates released?', 'We ship regular improvements, feature updates, and fixes based on feedback from students and university teams.'],
  ['Can I integrate it with external APIs?', 'Custom integrations are available for university plans. Contact us to discuss your campus systems and workflow needs.'],
  ['Does the platform support dark mode?', 'Yes. Univo supports a dark interface for a more comfortable experience, especially during late-night study sessions.'],
  ['What happens if I lose my data?', 'Your workspace data is securely stored and backed up. If you need help recovering access, our support team is here to assist.'],
  ['Can I customize the UI components?', 'University workspaces can be tailored with the right workflows, permissions, and integrations for their campus.'],
]

function Logo() {
  return (
    <Link className="logo homeButton" to="/" aria-label="Home — Univo" title="Home">
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
  const columns = [faqs.slice(0, 5), faqs.slice(5)]

  return (
    <section className="faqSection" id="faq">
      <div className="faqIntro">
        <span className="faqEyebrow">Frequently Asked Questions</span>
        <h2>Platform &amp; Product Support</h2>
        <p>Everything you need to know about how our platform works, from setup and<br className="faqDesktopBreak" /> customization to integrations and updates.</p>
        <a className="faqHelpButton" href="mailto:hello@univo.app">See Full Help Center <span aria-hidden="true">→</span></a>
      </div>
      <div className="faqGrid">
        {columns.map((column, columnIndex) => (
          <div className="faqList" key={columnIndex}>
            {column.map(([question, answer], itemIndex) => {
              const index = columnIndex * 5 + itemIndex
              const isOpen = active === index
              return (
                <div className={`faqItem ${isOpen ? 'active' : ''}`} key={question}>
                  <button className="faqQuestion" type="button" aria-expanded={isOpen} aria-controls={`faq-answer-${index}`} onClick={() => setActive(isOpen ? null : index)}>
                    <span>{question}</span>
                    <ChevronDown className="faqChevron" size={20} aria-hidden="true" />
                  </button>
                  {isOpen && <div className="faqAnswer" id={`faq-answer-${index}`}><p>{answer}</p></div>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

export function PricingSection() {
  const [annual, setAnnual] = useState(false)
  const plans = [
    { icon: Sparkles, name: 'Free', description: 'Perfect for getting started', price: 0, features: ['Personal dashboard', 'Attendance tracking', 'Notes Hub', 'Community access'], action: 'Get started' },
    { icon: Layers, name: 'Student Plus', description: 'For students who want more', price: annual ? 8 : 10, features: ['Everything in Free', 'Marketplace access', 'Priority notes sync', 'Advanced insights'], action: 'Choose plan' },
    { icon: Zap, name: 'Campus', description: 'For growing university communities', price: annual ? 24 : 29, featured: true, features: ['Everything in Student Plus', 'Unlimited workflows', 'Teacher and admin tools', 'Analytics and reporting'], action: 'Choose plan' },
    { icon: Building2, name: 'University', description: 'A complete campus workspace', price: null, features: ['Everything in Campus', 'Isolated university workspace', 'Dedicated support', 'Custom integrations'], action: 'Contact sales' },
  ]

  return (
    <div className="pricingPage">
      <nav className="nav pricingPageNav">
        <Logo />
        <div className="desktopNav pricingPageLinks">
          <div className="navPill">
            <a href="/" className="navLink">Home</a>
            <Link to="/features" className="navLink">Features</Link>
            <a href="/#faq" className="navLink">FAQ</a>
          </div>
        </div>
      </nav>
      <section className="pricingSection" id="pricing">
      <div className="pricingIntro">
        <span className="eyebrow">Simple, transparent plans</span>
        <h2>Choose your campus plan.</h2>
        <p>Start small, stay organized, and grow with Univo.</p>
        <div className="billingToggle" role="group" aria-label="Billing period">
          <button type="button" className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>Monthly</button>
          <button type="button" className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>Annually <span>Save 20%</span></button>
        </div>
      </div>
      <div className="pricingGrid">
        {plans.map(({ icon: Icon, ...plan }) => (
          <article className={`pricingCard ${plan.featured ? 'featured' : ''}`} key={plan.name}>
            {plan.featured && <span className="pricingBadge">Best value</span>}
            <div className="pricingIcon"><Icon size={19} /></div>
            <h3>{plan.name}</h3>
            <p className="pricingDescription">{plan.description}</p>
            <div className="pricingPrice">{plan.price === null ? 'Custom' : `$${plan.price}`}<small>{plan.price === null ? ' pricing' : '/month'}</small></div>
            <a className="pricingButton" href={plan.name === 'University' ? 'mailto:hello@univo.app' : '/?login=student'}>{plan.action}</a>
            <div className="pricingFeatures"><strong>Features</strong>{plan.features.map((feature) => <span key={feature}>✓ {feature}</span>)}</div>
          </article>
        ))}
      </div>
      </section>
      <SiteFooter />
    </div>
  )
}

export default function LandingPage() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loginPath = searchParams.get('login')

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
                    <a key={link} href={link === 'FAQ' ? '#faq' : link === 'Features' ? '/features' : link === 'Pricing' ? '/pricing' : '#'} className="navLink">
                    {link}{link === 'For Universities' && <ChevronDown size={14} />}
                  </a>
                ))}
              </div>
            </div>
            <button className="menuButton" type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
              <Menu className={open ? 'icon hiddenIcon' : 'icon'} size={22} />
              <X className={open ? 'icon' : 'icon hiddenIcon'} size={22} />
            </button>
          </nav>

          <div className={`backdrop ${open ? 'shown' : ''}`} onClick={() => setOpen(false)} />
          <aside className={`drawer ${open ? 'open' : ''}`}>
            <div className="drawerLinks">
              {links.map((link, i) => (
                  <a href={link === 'FAQ' ? '#faq' : link === 'Features' ? '/features' : link === 'Pricing' ? '/pricing' : '#'} key={link} onClick={() => setOpen(false)} style={{ transitionDelay: open ? `${(i + 1) * 60}ms` : '0ms' }}>
                  {link}{link === 'For Universities' && <ChevronDown size={18} />}
                </a>
              ))}
            </div>
          </aside>

          <main className="main">
            <div className="copy">
              <h1>Your campus life,<br />finally in one place.</h1>
              <p className="heroSub">Plan, track, connect — whether you're flying solo or part of a university workspace.</p>

              {/* Dual entry points */}
              <div className="entryPoints">
                <Link to="/?login=student" className="entryCard entryStudent">
                  <GraduationCap size={22} />
                  <div>
                    <strong>I'm a Student</strong>
                    <span>Personal dashboard · Notes · Community</span>
                  </div>
                </Link>
                <Link to="/?login=university" className="entryCard entryUniversity">
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
          <TextLoop
            staticText="Individual"
            rotatingTexts={['freedom.', 'focus.', 'momentum.']}
            className="landingTextLoop sectionTextLoop"
            staticTextClassName="landingTextLoopStatic"
            rotatingTextClassName="landingTextLoopRotating"
          />
          <h2 className="sectionSecondHeading">Institutional power.</h2>
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
          <Link to="/?login=student" className="darkButton">Try the demo</Link>
        </div>
        <div className="steps">
          <div><span>1</span><p><strong>Sign up</strong><br />Two clear entry points — student or university.</p></div>
          <div><span>2</span><p><strong>Get routed</strong><br />One login form, role-based redirect to your dashboard.</p></div>
          <div><span>3</span><p><strong>Thrive</strong><br />Track, connect, and actually enjoy your semester.</p></div>
        </div>
      </section>

      <FAQSection />
      <TestimonialMarquee />

      <footer className="footer">
        <div className="footerTop">
          <div className="footerBrand">
            <Logo />
            <p>Your campus companion — dark, premium, and built for the way students actually live.</p>
            <Link to="/?login=student" className="footerLogin">Get started free</Link>
          </div>
          <div className="footerColumn"><span className="footerHeading">Product</span><a href="#top">Home</a><a href="#faq">FAQ</a><Link to="/features">Features</Link></div>
          <div className="footerColumn"><span className="footerHeading">For students</span><Link to="/?login=student">Individual plan</Link><Link to="/?login=student">Notes Hub</Link><Link to="/?login=student">Marketplace</Link></div>
          <div className="footerColumn"><span className="footerHeading">For universities</span><Link to="/?login=university">Institutional plan</Link><a href="mailto:hello@univo.app">Contact sales</a></div>
        </div>
        <div className="footerBottom">
          <span>© 2026 Univo. Built for students.</span>
          <span className="statusPill"><i /> All systems operational</span>
        </div>
      </footer>
      {loginPath && <LoginPage embedded initialPath={loginPath} />}
    </>
  )
}
