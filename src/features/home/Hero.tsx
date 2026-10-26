// The big welcome section at the top of the page.
// The text comes from src/data/profile.ts.

import { profile } from '../../data/profile.ts'
import Icon from '../../components/Icon.tsx'
import SocialLinks from '../../components/SocialLinks.tsx'
import { asset } from '../../utils/asset.ts'

// "Ali Chahine" → "AC". Shown in the circle until you add a photo.
const initials = profile.name
  .split(' ')
  .map((word) => word[0])
  .join('')

function Hero() {
  return (
    // id="home" lets the navbar link "/#home" scroll here.
    <section id="home" className="section hero">
      <div className="hero__text">
        <p className="eyebrow">{profile.role}</p>
        {/* Hover the heading: a color sweep runs across the name. */}
        <h1 className="hero__title">
          Hi, I'm <span className="hero__name">{profile.name}</span>
        </h1>
        <p className="hero__tagline">{profile.tagline}</p>

        <ul className="hero__meta">
          <li>
            <Icon name="pin" size={16} /> {profile.location}
          </li>
          {profile.availability && (
            <li className="hero__available">
              <span className="hero__available-dot" /> {profile.availability}
            </li>
          )}
        </ul>

        {/* Buttons and icon links sit side by side in a row. */}
        <div className="hero-actions">
          <a href="#projects" className="button">
            View my work
          </a>
          {/* The PDF lives in /public, so it is served from the site root. */}
          <a href={asset('/Ali_Chahine_CV.pdf')} download="Ali_Chahine_CV.pdf" className="button button-outline">
            Download CV
          </a>
          <SocialLinks />
        </div>
      </div>

      <div className="hero__photo">
        {profile.photo ? <img src={asset(profile.photo)} alt={profile.name} /> : <span>{initials}</span>}
      </div>
    </section>
  )
}

export default Hero
