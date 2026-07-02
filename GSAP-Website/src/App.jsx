import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import HeroAnimation from './Components/Hero/Hero'
import About from './Components/About/About'
import Contact from './Components/Contact/Contact'
import Features from './Components/Features/Features'
import Footer from './Components/Footer/Footer'
import Navbar from './Components/Navbar/Navbar'
import WatchHero from './Components/WatchHero/WatchHero'
import HeroAnimation2 from './Components/Hero2/Hero2'
import SubSection from './Components/SubSection/SubSection'
import Products from './Components/Products/Products'
import Scene from './Components/Watch/Scene'
import Cursor from './Components/Cursor/Cursor'
import GlobalEffects from './Components/Cursor/GlobalEffect/GlobalEffect'

function App() {

  return (
    <>
      <div className='app-container'>
        <Navbar />
        <Cursor />
        <GlobalEffects />
        {/* <WatchHero /> */}
        <HeroAnimation2 />
        <SubSection />
        <HeroAnimation />
        <Products />
            <div style={{ width: "100vw", height: "100vh" }}>
          <Scene />
        </div>
        <About />
        <Features />
        <Contact />
        <Footer />

      </div>
    </>
  )
}

export default App
