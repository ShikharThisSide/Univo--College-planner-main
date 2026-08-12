import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CalendarCheck, Check, GraduationCap, Users, UserRound, BookOpen } from 'lucide-react'
import '../../styles.css'
import Typewriter from '../../components/ui/Typewriter'
import SiteFooter from '../../components/layout/SiteFooter'

function StudentLogo() {
  return <Link className="logo studentPlanLogo" to="/" aria-label="Back to Univo home"><GraduationCap size={24} /><span>Univo</span></Link>
}

const studentCapabilities = [
  { icon: BookOpen, title: 'Your individual plan', text: 'Manage your curriculum, subjects, assignments, notes, and semester goals from one calm workspace.' },
  { icon: CalendarCheck, title: 'Attendance that stays clear', text: 'Track attendance by subject, spot patterns early, and know exactly where you stand before exams.' },
  { icon: Users, title: 'CR tools included', text: 'Class Representatives get a dedicated space to maintain the student list and coordinate class attendance.' },
  { icon: UserRound, title: 'Personal student details', text: 'Keep your profile, academic details, and campus preferences organised and easy to update.' },
]

const universityCapabilities = [
  { icon: BookOpen, title: 'One campus workspace', text: 'Bring curriculum planning, notices, resources, and academic workflows into one organised university workspace.' },
  { icon: CalendarCheck, title: 'Attendance visibility', text: 'Give teachers and administrators a clear view of attendance trends across classes, departments, and semesters.' },
  { icon: Users, title: 'Connected campus roles', text: 'Coordinate students, teachers, administrators, and class representatives with role-based access.' },
  { icon: UserRound, title: 'Personalised experiences', text: 'Create focused dashboards and details for every member of your university community.' },
]

export default function StudentPlanPage({ variant = 'student' }) {
  const isUniversity = variant === 'university'
  const capabilities = isUniversity ? universityCapabilities : studentCapabilities
  const audience = isUniversity ? 'University workspace' : 'Individual student plan'
  const title = isUniversity ? 'Your campus,<br />' : 'Your college life,<br />'
  const rotatingText = isUniversity ? ['connected.', 'in one place.', 'ready to grow.'] : ['in your hands.', 'made personal.', 'more manageable.']
  return (
    <div className="studentPlanPage">
      <nav className="studentPlanNav"><StudentLogo /><div className="studentPlanNavLinks"><a href="#overview">Overview</a><a href="#features">Features</a><a href="#cr-tools">{isUniversity ? 'Campus tools' : 'CR tools'}</a><Link className="studentPlanSignIn" to={`/?login=${isUniversity ? 'university' : 'student'}`}>{isUniversity ? 'Talk to us' : 'Sign in'} <ArrowUpRight size={15} /></Link></div></nav>
      <main>
        <section className="studentPlanHero" id="overview">
          <div className="studentPlanHeroCopy"><span className="eyebrow">{audience}</span><h1 dangerouslySetInnerHTML={{ __html: title }} /><h1 className="studentPlanTypedHeading"><em><Typewriter text={rotatingText} speed={75} deleteSpeed={42} delay={1700} loop /></em></h1><p>{isUniversity ? 'A connected command centre for your university, bringing students, teachers, administrators, and campus workflows together.' : 'A personal command centre for your curriculum, attendance, notes, and the people you learn with. Built for students who want a clearer semester.'}</p><div className="studentPlanActions"><Link className="studentPlanPrimary" to={`/?login=${isUniversity ? 'university' : 'student'}`}>{isUniversity ? 'Build your campus workspace' : 'Start your individual plan'} <ArrowRight size={17} /></Link><a className="studentPlanSecondary" href="#features">Explore features</a></div><div className="studentPlanMeta"><span><Check size={15} /> {isUniversity ? 'Role-based access' : 'Personal workspace'}</span><span><Check size={15} /> {isUniversity ? 'Built for every department' : 'Built for every semester'}</span></div></div>
          <div className="studentPlanVisual"><div className="studentPlanOrb studentPlanOrbOne" /><div className="studentPlanOrb studentPlanOrbTwo" /><div className="studentPlanDashboard"><div className="studentPlanDashTop"><span>MY SEMESTER</span><strong>Spring · 2026</strong></div><div className="studentPlanProgress"><div><span>Semester progress</span><b>68%</b></div><i><u /></i></div><div className="studentPlanSubjects"><div><span className="subjectDot lime" />Data Structures <b>92%</b></div><div><span className="subjectDot blue" />Computer Networks <b>84%</b></div><div><span className="subjectDot coral" />Operating Systems <b>76%</b></div></div></div><div className="studentPlanFloat"><CalendarCheck size={18} /><span><b>Attendance</b><small>All subjects on track</small></span><strong>86%</strong></div></div>
        </section>
        <section className="studentPlanIntro"><span className="eyebrow">{isUniversity ? 'One campus, connected' : 'One plan, made personal'}</span><h2>{isUniversity ? <>Everything your university needs to<br /><em>move forward together.</em></> : <>Everything you need to<br /><em>move through college.</em></>}</h2><p>{isUniversity ? 'Univo gives university teams a shared, structured space to manage academic workflows and create a better campus experience.' : 'Univo gives individual students a focused place to plan their work and stay close to their campus community — without the noise.'}</p></section>
        <section className="studentPlanFeatures" id="features">{capabilities.map(({ icon: Icon, title, text }) => <article key={title}><div className="studentPlanIcon"><Icon size={21} /></div><h3>{title}</h3><p>{text}</p><ArrowUpRight className="studentPlanFeatureArrow" size={18} /></article>)}</section>
        <section className="studentPlanCr" id="cr-tools"><div><span className="eyebrow">{isUniversity ? 'For university teams' : 'For the class representative'}</span><h2>{isUniversity ? <>More visibility.<br /><em>Less admin.</em></> : <>A little more responsibility.<br /><em>A lot less admin.</em></>}</h2><p>{isUniversity ? 'Give every department the tools it needs to coordinate classes, monitor progress, and keep students supported throughout the academic year.' : 'When you are the CR, your individual plan comes with a shared layer for the class. Add your list of students, manage attendance, and keep everyone aligned from one place.'}</p><Link className="studentPlanPrimary" to={`/?login=${isUniversity ? 'university' : 'student'}`}>{isUniversity ? 'Plan your campus workspace' : 'See the student workspace'} <ArrowRight size={17} /></Link></div><div className="studentPlanRoster"><div className="rosterHeader"><span>{isUniversity ? 'CAMPUS OVERVIEW' : 'CLASS ROSTER'}</span><b>{isUniversity ? '+ Add department' : '+ Add student'}</b></div><div className="rosterTitle"><strong>{isUniversity ? 'Univo University · 2026' : 'Computer Science · Sem 4'}</strong><small>{isUniversity ? '12 departments · 4,280 students' : '28 students · 86% average attendance'}</small></div>{(isUniversity ? ['Computer Science','Business Studies','Design & Media'] : ['Aarav Mehta','Siddharth Agarwal','Ananya Iyer']).map((name, i) => <div className="rosterRow" key={name}><span className={`rosterAvatar avatar${i}`}>{name.split(' ').map((n) => n[0]).join('')}</span><strong>{name}</strong><small>{isUniversity ? `${[1240, 860, 540][i]} students` : i === 1 ? 'CR · You' : 'Present today'}</small><Check size={15} /></div>)}</div></section>
        <section className="studentPlanCta"><span className="eyebrow">{isUniversity ? 'Your campus starts here' : 'Your semester starts here'}</span><h2>{isUniversity ? <>Make university feel<br /><em>more connected.</em></> : <>Make college feel<br /><em>more manageable.</em></>}</h2><Link className="studentPlanPrimary" to={`/?login=${isUniversity ? 'university' : 'student'}`}>{isUniversity ? 'Create your campus workspace' : 'Create your individual plan'} <ArrowRight size={17} /></Link></section>
      </main>
      <SiteFooter />
    </div>
  )
}
