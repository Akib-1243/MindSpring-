import { useEffect, useState } from 'react'
import './App.css'

const schools = [['01', 'Computing & Data', 'Build intelligent systems for a changing world.'], ['02', 'Business & Leadership', 'Turn insight into responsible, practical impact.'], ['03', 'Health & Life Sciences', 'Improve lives through evidence and curiosity.']]
const researchAreas = ['Artificial intelligence', 'Sustainable futures', 'Digital society', 'Human performance']

function FacultyLogin() {
    const [error, setError] = useState('')

    return <div className="faculty-page">
        <a className="back-link" href="/">← Back to Relavanet Uni</a>
        <div className="faculty-login-wrap">
            <div className="faculty-intro"><div className="eyebrow"><span className="eyebrow-dot" /> RELAVANET UNIVERSITY · FACULTY SERVICES</div><h1>Make every<br /><em>question</em> count.</h1><p>Access the Academic Quality Control Suite to compare syllabi, review assessment risk, and build stronger learning experiences.</p><div className="faculty-note"><strong>Faculty portal</strong><span>Secure workspace for curriculum teams and teaching staff.</span></div></div>
            <form className="faculty-form" onSubmit={async (event) => { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); try { const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/faculty/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); if (!response.ok) throw new Error('Invalid faculty credentials.'); const data = await response.json(); localStorage.setItem('relavanet_token', data.token); window.location.href = '/faculty-dashboard' } catch (requestError) { setError(requestError.message) } }}><div className="section-label">/ SIGN IN</div><h2>Welcome back.</h2><p>Use your university credentials to continue.</p><label>University email<input name="email" type="email" placeholder="name@relavanet.edu" required /></label><label>Password<input name="password" type="password" placeholder="Enter your password" required /></label><div className="form-row"><label className="check-label"><input type="checkbox" /> Remember me</label><a href="mailto:it@relavanet.edu">Need help?</a></div><button className="primary-button" type="submit">Enter faculty portal <span>↗</span></button>{error && <div className="form-error">{error}</div>}</form>
        </div>
    </div>
}

function FacultyDashboard() {
    const [courses, setCourses] = useState([])
    const [tool, setTool] = useState('exam')
    const [message, setMessage] = useState('')
    const api = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const token = localStorage.getItem('relavanet_token')

    useEffect(() => { if (token) fetch(`${api}/faculty/courses`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }).then((response) => response.ok ? response.json() : []).then(setCourses).catch(() => setCourses([])) }, [api, token])

    const analyze = async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const endpoint = tool === 'exam' ? '/faculty/exam/analyze' : '/faculty/syllabus/analyze'; const payload = tool === 'exam' ? { course_id: form.get('course_id'), new_question: form.get('new_question') } : { course_a_id: form.get('course_a_id'), course_b_id: form.get('course_b_id') }; const response = await fetch(`${api}${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) }); setMessage(response.ok ? 'Analysis saved to your faculty history.' : 'The analysis could not be completed. Check the selected courses and try again.') }

    return <div className="dashboard-page"><header className="dashboard-header"><a className="brand" href="/"><span className="brand-mark">R</span><span>relavanet<span className="brand-light">uni</span></span></a><div><span className="faculty-status">FACULTY WORKSPACE</span><button className="logout-link" onClick={() => { localStorage.removeItem('relavanet_token'); window.location.href = '/faculty-login' }}>Sign out</button></div></header><main className="dashboard-main"><div className="dashboard-intro"><div className="section-label">/ ACADEMIC QUALITY CONTROL SUITE</div><h1>Good morning,<br /><em>faculty.</em></h1><p>Make assessment decisions with a clearer view of curriculum overlap, alignment, and risk.</p></div><div className="tool-switcher"><button className={tool === 'exam' ? 'active' : ''} onClick={() => setTool('exam')}><span>01</span><strong>Exam forensics</strong><small>Check originality and syllabus alignment.</small></button><button className={tool === 'syllabus' ? 'active' : ''} onClick={() => setTool('syllabus')}><span>02</span><strong>Syllabus duet</strong><small>Find overlap and strategic edges.</small></button></div><form className="analysis-form" onSubmit={analyze}><div className="section-label">/ {tool === 'exam' ? 'NEW FORENSIC ANALYSIS' : 'NEW SYLLABUS COMPARISON'}</div>{tool === 'exam' ? <><label>Course<select name="course_id" required><option value="">Select a course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}</select></label><label>New exam question<textarea name="new_question" rows="5" placeholder="Paste the question you want to audit..." required /></label></> : <div className="course-pair"><label>Source A<select name="course_a_id" required><option value="">Select a course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}</select></label><label>Source B<select name="course_b_id" required><option value="">Select a course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}</select></label></div>}<button className="primary-button" type="submit">Run analysis <span>↗</span></button>{message && <p className="analysis-message">{message}</p>}</form></main></div>
}

function App() {
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: 0.14 })
        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    if (window.location.pathname === '/faculty-login') return <FacultyLogin />
    if (window.location.pathname === '/faculty-dashboard') return <FacultyDashboard />

    const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

    return <div className="site-shell">
        <nav className="nav container">
            <a className="brand" href="#home"><span className="brand-mark">R</span><span>relavanet<span className="brand-light">uni</span></span></a>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button>
            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                {['Study', 'Research', 'About'].map((item) => <a href={`#${item.toLowerCase()}`} key={item} onClick={() => setMenuOpen(false)}>{item}</a>)}
                <a className="nav-login" href="/faculty-login">Faculty portal <span>↗</span></a>
            </div>
        </nav>

        <main>
            <section className="hero container" id="home">
                <div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-dot" /> RELAVANET UNIVERSITY · EST. 2008</div><h1>LEARN WITH<br /><em>PURPOSE.</em><br />LEAD WITH<br />IMPACT<span className="period">.</span></h1><p className="hero-description">A forward-looking university for people who want to turn knowledge into meaningful change. Find your place, then make it matter.</p><div className="hero-actions"><button className="primary-button" onClick={() => scrollTo('#study')}>Explore study <span>↗</span></button><a className="play-link" href="#about"><span className="play">▶</span> Discover Relavanet</a></div><div className="hero-proof"><strong>16:1</strong><small>student to faculty ratio</small><strong>94%</strong><small>graduate employment</small></div></div>
                <div className="hero-visual reveal"><div className="sun-orb" /><div className="scribble">make<br />it matter</div><div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=900&q=85" alt="University students walking across campus" /></div><div className="floating-card quote-card"><span>“</span><p>Education is the most powerful tool we can use to change the world.</p><small>— Nelson Mandela</small></div><div className="floating-card stat-card"><strong>40+</strong><small>programmes<br />to explore</small><span>↗</span></div></div>
            </section>
            <section className="features container reveal" id="study">{schools.map(([number, title, text]) => <article className="feature-card" key={title}><div className="feature-top"><span>{number}</span><b>↗</b></div><h3>{title}</h3><p>{text}</p><a href="#about">Explore school <span>↗</span></a></article>)}</section>
            <section className="content-grid container" id="about"><div className="mission reveal"><div className="section-label">/ OUR PROMISE</div><h2>THE UNIVERSITY<br />FOR <em>WHAT'S NEXT</em><span>.</span></h2><p>Relavanet brings ambitious people, practical learning, and big questions together. We give every student the confidence to think independently and the tools to contribute generously.</p><a className="text-link" href="#research">Meet our community <span>↗</span></a></div><aside className="side-panel reveal" id="research"><div className="panel-heading"><div><div className="section-label">/ RESEARCH</div><h3>Questions worth asking</h3></div><button aria-label="Explore research">↗</button></div><div className="subject-list">{researchAreas.map((area, index) => <a href="#about" className="subject" key={area}><span className="subject-icon">0{index + 1}</span><span><strong>{area}</strong><small>Research area</small></span><span className="arrow">↗</span></a>)}</div><div className="learners-card"><img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=700&q=80" alt="Researchers working in a university laboratory" /><div className="learners-overlay"><strong>120+</strong><span>ACTIVE<br />PROJECTS</span><span className="plus">+</span></div></div></aside></section>
        </main>
        <footer className="footer"><div className="container footer-inner"><a className="brand" href="#home"><span className="brand-mark">R</span><span>relavanet<span className="brand-light">uni</span></span></a><p>Knowledge with purpose. Progress with people.</p><div className="socials"><a href="#home">in</a><a href="#home">𝕏</a><a href="#home">◎</a></div><small>© 2026 Relavanet University. All rights reserved.</small></div></footer>
    </div>
}
export default App
