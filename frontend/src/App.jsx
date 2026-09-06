import { useEffect, useState } from 'react'
import './App.css'

const subjects = [['✦', 'Design', '24 courses'], ['⌁', 'Development', '48 courses'], ['◒', 'Business', '31 courses'], ['⌘', 'Marketing', '19 courses']]
const features = [['01', '1,000+ Knowledge Paths', 'Build a learning journey that fits your goals, schedule, and curiosity.', '↗'], ['02', 'Empowered Learning', 'Learn by doing with practical lessons led by people who know the way.', '✧'], ['03', 'Thriving Community', 'Meet curious people, share progress, and grow together every day.', '◎']]

function App() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [loginOpen, setLoginOpen] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: 0.14 })
        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    const handleLogin = (event) => { event.preventDefault(); setLoggedIn(true); setLoginOpen(false) }
    const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

    return <div className="site-shell">
        <nav className="nav container">
            <a className="brand" href="#home"><span className="brand-mark">m</span><span>Mind<span className="brand-light">Spring</span></span></a>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button>
            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                {['Home', 'Courses', 'Learning Paths', 'About'].map((item) => <a href={`#${item === 'Home' ? 'home' : item.toLowerCase().replace(' ', '-')}`} key={item} onClick={() => setMenuOpen(false)}>{item}</a>)}
                <button className="nav-login" onClick={() => setLoginOpen(true)}>{loggedIn ? 'My account' : 'Register Now'} <span>↗</span></button>
            </div>
        </nav>

        <main>
            <section className="hero container" id="home">
                <div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-dot" /> THE FUTURE OF LEARNING IS HERE</div><h1>SHAPING MINDS,<br /><em>BUILDING FUTURES</em><br />THROUGH SMARTER<br />LEARNING<span className="period">.</span></h1><p className="hero-description">We believe learning should feel like an adventure. Discover your potential with a community that grows together.</p><div className="hero-actions"><button className="primary-button" onClick={() => scrollTo('#learning-paths')}>Explore learning <span>↗</span></button><a className="play-link" href="#about"><span className="play">▶</span> See how it works</a></div><div className="hero-proof"><div className="avatars"><img src="https://i.pravatar.cc/80?img=32" alt="Learner" /><img src="https://i.pravatar.cc/80?img=12" alt="Learner" /><img src="https://i.pravatar.cc/80?img=47" alt="Learner" /><span>+</span></div><div><strong>100K+</strong><small>Happy learners worldwide</small></div></div></div>
                <div className="hero-visual reveal"><div className="sun-orb" /><div className="scribble">learn<br />different</div><div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85" alt="Smiling students learning together" /></div><div className="floating-card quote-card"><span>“</span><p>Education is not preparation for life; education is life itself.</p><small>— John Dewey</small></div><div className="floating-card stat-card"><strong>94%</strong><small>course completion<br />rate</small><span>↗</span></div></div>
            </section>
            <section className="features container reveal" id="courses">{features.map(([number, title, text, icon]) => <article className="feature-card" key={title}><div className="feature-top"><span>{number}</span><b>{icon}</b></div><h3>{title}</h3><p>{text}</p><a href="#learning-paths">Discover more <span>↗</span></a></article>)}</section>
            <section className="content-grid container" id="learning-paths"><div className="mission reveal" id="about"><div className="section-label">/ OUR MISSION</div><h2>SHAPING THE FUTURE<br />OF LEARNING WITH<br /><em>LAB ACADEMY</em><span>.</span></h2><p>We are building a world where anyone can learn anything, at any time, and feel supported along the way. MindSpring is your space to think bigger, experiment boldly, and become who you are meant to be.</p><a className="text-link" href="#subjects">Read our story <span>↗</span></a></div><aside className="side-panel reveal" id="subjects"><div className="panel-heading"><div><div className="section-label">/ EXPLORE</div><h3>Popular subjects</h3></div><button aria-label="View all subjects">↗</button></div><div className="subject-list">{subjects.map(([icon, name, count]) => <a href="#courses" className="subject" key={name}><span className="subject-icon">{icon}</span><span><strong>{name}</strong><small>{count}</small></span><span className="arrow">↗</span></a>)}</div><div className="learners-card"><img src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=700&q=80" alt="Diverse group of learners" /><div className="learners-overlay"><strong>100K+</strong><span>HAPPY<br />LEARNERS</span><span className="plus">+</span></div></div></aside></section>
        </main>
        <footer className="footer"><div className="container footer-inner"><a className="brand" href="#home"><span className="brand-mark">m</span><span>Mind<span className="brand-light">Spring</span></span></a><p>Curious minds. Brighter futures.</p><div className="socials"><a href="#home">in</a><a href="#home">𝕏</a><a href="#home">◎</a></div><small>© 2024 MindSpring. Made for curious minds.</small></div></footer>
        {loginOpen && <div className="modal-backdrop" onMouseDown={() => setLoginOpen(false)}><div className="login-modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setLoginOpen(false)}>×</button><div className="section-label">/ WELCOME BACK</div><h2>Ready to <em>grow?</em></h2><p>Sign in to continue your learning journey.</p><form onSubmit={handleLogin}><label>Email address<input type="email" placeholder="you@example.com" required /></label><label>Password<input type="password" placeholder="••••••••" required /></label><button className="primary-button" type="submit">Enter MindSpring <span>↗</span></button></form><small className="demo-note">Demo mode · any email and password will work</small></div></div>}
    </div>
}
export default App
