import { ArrowRight, BookOpen, ShoppingBag, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import SiteFooter from '../../components/layout/SiteFooter'

const content = {
  individual: { icon: Sparkles, eyebrow: 'FOR STUDENTS', title: 'Your whole semester, in one place.', text: 'A focused personal command centre for planning classes, tracking habits, managing money, and staying ahead without the noise.', points: ['Smart timetable and assignment planning', 'Attendance, expenses, notes, and progress insights', 'Your preferences synced securely across devices'], cta: 'Create my free account' },
  notes: { icon: BookOpen, eyebrow: 'KNOWLEDGE, ORGANIZED', title: 'Turn scattered notes into momentum.', text: 'Capture, organize, export, and discover the ideas that make your next exam feel a little less impossible.', points: ['Subject-based notes with rich organization', 'Export study material when you need it', 'Discover useful notes from your campus community'], cta: 'Explore Notes Hub' },
  marketplace: { icon: ShoppingBag, eyebrow: 'CAMPUS EXCHANGE', title: 'Give great study material a second life.', text: 'Buy and sell verified notes, past papers, and study resources with the people who understand your course best.', points: ['List notes and resources in minutes', 'Find relevant material from fellow students', 'Keep your campus knowledge moving'], cta: 'Enter the Marketplace' },
}

export default function ProductDetailPage() {
  const { slug = 'individual' } = useParams()
  const item = content[slug] || content.individual
  const Icon = item.icon
  return <div className="productDetailPage"><main className="productDetailHero"><Link to="/" className="productBack">← Back to Univo</Link><div className="productDetailOrb"><Icon size={34} /></div><span className="productDetailEyebrow">{item.eyebrow}</span><h1>{item.title}</h1><p>{item.text}</p><div className="productDetailGrid">{item.points.map((point, index) => <div className="productDetailCard" key={point}><span>0{index + 1}</span><strong>{point}</strong></div>)}</div><Link className="productDetailCta" to="/?login=student">{item.cta} <ArrowRight size={18} /></Link></main><SiteFooter /></div>
}
