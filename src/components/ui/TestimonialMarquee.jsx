const reviews = [
  ['Harshita', '@harshita', 'Univo turned my scattered college plans into one clear path. I always know what to work on next.', 47],
  ['Ashutosh', '@ashutosh', 'The attendance tools and notes hub make staying on top of the semester genuinely simple.', 12],
  ['Siddharth', '@siddharth', 'It feels polished, focused, and actually built for how students manage college life.', 68],
  ['Prakhar', '@prakhar', 'Everything I need for classes, assignments, and campus planning is finally in one place.', 33],
  ['Shikhar', '@shikhar', 'The dashboard gives me a clear view of my priorities without the usual spreadsheet chaos.', 14],
  ['Ayush', '@ayush', 'A clean way to track progress and keep the whole semester moving forward.', 51],
  ['Karan', '@karan', 'The university workspace makes coordination between students and teachers much easier.', 7],
  ['Ahmad', '@ahmad', 'Simple, fast, and useful from the first day I started using it.', 23],
  ['Khushi', '@khushi', 'The notes and community features make Univo feel like a real campus companion.', 44],
  ['Priyanshu', '@priyanshu', 'I spend less time organizing my semester and more time actually getting things done.', 61],
  ...[
    ['Aarav', 'I use the weekly view before every Monday lecture—it stops deadlines from sneaking up on me.'],
    ['Advait', 'The attendance calculator is tiny but brilliant; I finally know which classes I can safely miss.'],
    ['Arjun', 'I keep my lab notes here now, and finding an old explanation before exams takes seconds.'],
    ['Ayan', 'The clean layout is what won me over. There is no digging through five different menus.'],
    ['Dev', 'I started using the assignment list for my first semester and it has become part of my routine.'],
    ['Dhruv', 'The reminders are subtle enough not to be annoying, but they have saved me more than once.'],
    ['Ishaan', 'It is refreshing to see my timetable and pending work together instead of in separate apps.'],
    ['Kabir', 'Our teacher shares notes through the workspace and everyone in class can actually find them.'],
    ['Kiaan', 'The progress view gave me the push I needed when I was falling behind in two subjects.'],
    ['Kush', 'I like that the community feels useful rather than noisy—people share actual notes and answers.'],
    ['Navin', 'Planning my week on Univo takes less than five minutes and makes the rest of it feel lighter.'],
    ['Nirvaan', 'The dashboard is fast even on my phone, which matters when I am checking it between classes.'],
    ['Reyansh', 'I used to forget tutorial deadlines constantly. The assignment section has fixed that habit.'],
    ['Rohan', 'The campus announcements and personal tasks finally live in one place for me.'],
    ['Samar', 'The interface feels calm during exam season, when every other app seems overwhelming.'],
    ['Shaurya', 'I can see my attendance trend instead of guessing whether I am close to the cutoff.'],
    ['Shray', 'The notes hub is especially useful when different classmates contribute to the same subject.'],
    ['Ved', 'I signed up for attendance tracking and ended up using the timetable and forum every day too.'],
    ['Viaan', 'The quick navigation makes it easy to jump from a class schedule straight into an assignment.'],
    ['Vihaan', 'I appreciate that the student tools do not feel like they were designed for a corporate office.'],
    ['Vivaan', 'My semester feels much more manageable now that every due date has a visible home.'],
    ['Yash', 'The streaks are a small touch, but they made me surprisingly consistent with my revision.'],
    ['Yuvan', 'I share the dashboard with my study group and we use it to keep each other accountable.'],
    ['Zayan', 'The app loads quickly and gives me exactly the information I need before class starts.'],
    ['Aadhya', 'I love having a quiet place for notes that is separate from all the chat notifications.'],
    ['Ahana', 'The assignment filters make it easy to see what is urgent without losing the bigger picture.'],
    ['Alia', 'I finally stopped keeping attendance calculations in a notebook after switching to Univo.'],
    ['Ananya', 'The interface is simple enough to use immediately, but still has the details I need later.'],
    ['Anika', 'The forum helped me find classmates working on the same topic before our internal assessment.'],
    ['Anvi', 'I check the dashboard with my morning coffee and know exactly how my day is structured.'],
    ['Arya', 'It is the first planner I have actually continued using after the first week.'],
    ['Avni', 'The notes section makes revision much less stressful because everything is tagged and searchable.'],
    ['Diya', 'I like seeing small wins in the progress cards—it makes a busy semester feel achievable.'],
    ['Ira', 'The current-class indicator is a lovely detail when I am rushing across campus.'],
    ['Inaya', 'My friends and I use the shared spaces to swap resources without losing them in group chats.'],
    ['Isha', 'The design feels thoughtful and the important actions are always easy to find.'],
    ['Kavya', 'I used to rely on three reminders apps; now Univo handles most of my academic planning.'],
    ['Kiara', 'The weekly schedule helps me protect time for study instead of filling every gap accidentally.'],
    ['Meera', 'The clean cards make my workload feel less intimidating when several deadlines arrive together.'],
    ['Myra', 'I can quickly check what is due, what is in progress, and what I have already finished.'],
    ['Navya', 'The personal notes and university updates being separate makes the whole experience feel organized.'],
    ['Nisha', 'I found a useful set of revision notes through the community before my DBMS exam.'],
    ['Nitya', 'It is practical, not flashy for the sake of it. Every screen helps me do something quicker.'],
    ['Riya', 'The attendance rings give me a much clearer picture than a plain percentage ever did.'],
    ['Saanvi', 'I use the marketplace to find second-hand books and the dashboard to track everything else.'],
    ['Siya', 'The mobile layout is genuinely comfortable, which is where I do most of my planning.'],
    ['Tara', 'Univo helped me build a study rhythm instead of only reacting to deadlines at the last minute.'],
    ['Vanya', 'It feels like a proper companion for college, not just another checklist app.'],
  ].map(([name, body], index) => [
    name,
    `@${name.toLowerCase()}`,
    body,
    (index % 70) + 1,
  ]),
]

function ReviewCard({ review }) {
  const [name, username, body, image] = review
  return (
    <article className="testimonialMarqueeCard">
      <div className="testimonialIdentity">
        <img src={`https://i.pravatar.cc/64?img=${image}`} alt="" />
        <div><strong>{name}</strong><span>{username}</span></div>
      </div>
      <p>“{body}”</p>
    </article>
  )
}

function MarqueeRow({ items, reverse = false }) {
  return (
    <div className={`testimonialMarqueeTrack ${reverse ? 'reverse' : ''}`}>
      {[...items, ...items].map((review, index) => <ReviewCard key={`${review[0]}-${index}`} review={review} />)}
    </div>
  )
}

export default function TestimonialMarquee() {
  const midpoint = Math.ceil(reviews.length / 2)
  return (
    <section className="testimonialMarquee" aria-label="Student testimonials">
      <div className="testimonialMarqueeIntro"><span className="eyebrow">Students, in their own words</span><h2>Built for the way campus life moves.</h2></div>
      <div className="testimonialMarqueeRows"><MarqueeRow items={reviews.slice(0, midpoint)} /><MarqueeRow items={reviews.slice(midpoint)} reverse /></div>
    </section>
  )
}
