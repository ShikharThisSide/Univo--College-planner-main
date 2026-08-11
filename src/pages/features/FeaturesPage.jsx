import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import DotPattern from '../../components/ui/DotPattern'
import TextLoop from '../../components/ui/TextLoop'
import '../../styles.css'
import SiteFooter from '../../components/layout/SiteFooter'

const images = {
  hero: 'https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_hero_gradient.jpg',
  chat: 'https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_chat_gradient.png',
  moon: 'https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon.png',
}

export default function FeaturesPage() {
  return (
    <main className="featuresPage aboutStylePage">
      <nav className="nav featuresPageNav">
        <Link className="logo homeButton" to="/">Univo</Link>
        <div className="featuresDesktopNav"><Link to="/">Home</Link><Link className="active" to="/features">Features</Link><a href="/?login=student">For Students</a><a href="/?login=university">For Universities <ChevronDown size={14} /></a><Link to="/pricing">Pricing</Link><Link to="/#faq">FAQ</Link></div>
        <Link className="backLink" to="/"><ArrowLeft size={16} /> Back home</Link>
      </nav>

      <section className="aboutHero" id="features-top">
        <div className="aboutContainer">
          <motion.div className="aboutHeroVisual" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8 }}>
            <img className="aboutHeroImage" src={images.hero} alt="Abstract campus gradient" />
            <TextLoop staticText="Campus" rotatingTexts={['focus.', 'momentum.', 'community.', 'clarity.']} interval={2600} className="featuresHeroTextLoop" staticTextClassName="featuresHeroTextStatic" rotatingTextClassName="featuresHeroTextRotating" cursorClassName="featuresHeroTextCursor" />
          </motion.div>
          <div className="aboutHeroCopy">
            <motion.h1 initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .15, duration: .65 }}>Your campus <span>ecosystem</span> <em>for planning, connection, and momentum.</em></motion.h1>
            <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .25, duration: .65 }}><p>Univo brings together the tools students and universities need to make campus life feel simpler, clearer, and more connected.</p><Link className="aboutLearnMore" to="/?login=student">Get started <ChevronRight size={16} /></Link></motion.div>
          </div>
        </div>
      </section>

      <section className="aboutSection" id="features-tools">
        <div className="aboutContainer aboutContent">
          <div className="aboutHeading"><h2>Everything in one place</h2><p>One platform for individual students, university teams, and the community they share.</p></div>
          <div className="aboutFeatureLayout">
            <div className="aboutSideCards">
              <motion.article className="aboutImageCard aboutDarkCard" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 250, damping: 20 }}><div className="aboutCardImage"><img src={images.moon} alt="Individual student tools" /><div /></div><div className="aboutCardBody"><h3>Accelerate your semester</h3><p>Track attendance, manage assignments, keep notes, and stay connected from one personal workspace.</p><Link className="aboutOutlineButton" to="/?login=student">Learn More</Link></div></motion.article>
              <motion.article className="aboutImageCard aboutLightCard" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 250, damping: 20 }}><img src={images.hero} alt="Future-ready university workspace" /><div className="aboutOverlay"><h3>Future-ready campus</h3><p>Scalable tools for admins, teachers, and students—combining clarity with real workflows.</p></div></motion.article>
            </div>
          </div>
        </div>
      </section>

      <motion.section className="featuresQuote" initial={{ opacity: 0, y: 55 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: .75, ease: [0.16, 1, 0.3, 1] }}>
        <div className="featuresQuoteFrame">
          <DotPattern width={5} height={5} />
          <span className="quoteCorner quoteCornerTL" /><span className="quoteCorner quoteCornerTR" /><span className="quoteCorner quoteCornerBL" /><span className="quoteCorner quoteCornerBR" />
          <div className="featuresQuoteContent">
            <p className="quoteEyebrow">We believe</p>
            <div className="featuresQuoteText"><div><strong>"Campus life should feel</strong> <span>easy to</span></div><div><span>understand</span> <strong>because simple</strong></div><div><span>systems</span> <strong>are quicker to</strong></div><strong>use..."</strong></div>
          </div>
        </div>
      </motion.section>
      <SiteFooter />
    </main>
  )
}
