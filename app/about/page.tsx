// app/about/page.tsx
/* eslint-disable react/no-unescaped-entities */
import styles from './about.module.css';
import Footer from '../../components/ui/Footer'; 
import Link from "next/link"; 
import { Suspense } from 'react';
import Navbar from '../../components/ui/Navbar';
import Image from "next/image";

export default function AboutPage() {
  return (
   <> 
    <Suspense fallback={null}>
    <Navbar />
    </Suspense>
    <div className={styles.aboutPage}>
      <section className={styles.hero}>
        <h1>Disability Traveler isn't just another travel site, it's a community</h1>
        <p>
          Accessible travel shouldn’t be so difficult. Yet, far too often, critical details like transportation options, step-free access, or roll-in showers are buried, vague, or completely missing. This platform was built to make that information easier to find, so you can decide if a destination or place to stay is right for you before you book it. We provide clear, honest, researched, and most importantly, crowd-sourced accessibility information to help you travel to the places you want to go and actually know what to expect when you get there.
        </p>
      </section>

      <section className={`${styles.section} ${styles.differenceSection}`}>
        <h2>My Story</h2>
        <div className={styles.myStoryContent}>
          <div className={styles.imageWrapper}>
            <Image
              src="https://cdn.filestackcontent.com/TqPx5wMRTCGBmE6avNlQ?nocache=422opxum"
              alt="My wife and I on vacation"
              width={600}
              height={800}
              className={styles.storyImage}
            />
            <p className={styles.caption}>My wife and I on vacation</p>
          </div>
          
          <div>
            <p>I'm Joe. In May of 2000, when I was 15 years old, I was in a car accident that caused a spinal cord injury. I've been a T5 paraplegic and manual wheelchair user ever since.</p>
            <p>
              Adjusting to my new life took time, but I've built a life I'm proud of. I've earned a bachelor's degree from DePaul University, a law degree from the University of Illinois at Chicago, gotten married, bought a house, and found strength (both mental and physical) through my family, friends, weightlifting, and my dogs.
            </p>
            <p>
              One thing that hasn’t gotten easier over time is traveling as a wheelchair user. Even at home in the U.S., where the ADA requires accessibility, getting clear accessibility info isn’t always easy. And when you want to travel abroad, where there are no ADA requirements, figuring out whether accessibility even exists becomes an all-consuming task.
            </p>
            <p><strong>Disability Traveler was created to change that.</strong> It grew out of my own research, experiences, and the belief that our community should crowdsource our knowledge in one place so we can know what to expect before leaving the comfort of home.</p>
            <p>
              No matter if we’re traveling across the state or across the globe, we deserve to know what obstacles lie ahead and feel confident we’re prepared for them.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Why This Site Exists</h2>
        <p>
          <strong>We deserve a space that compiles accessible details in one place and allows us to share our real-world experiences to inform the community.</strong> Each person should be able to decide whether enough accessible features exist to make a particular destination or hotel feasible based on their individual needs.
        </p>
        <p>
          This is not about labeling somewhere accessible or inaccessible. It’s about describing what is actually there so you can make an informed decision and know what to expect when you arrive.
        </p>
      </section>


      <section className={`${styles.section} ${styles.differenceSection}`}>
        <h2>The Bigger Picture</h2>
        <p>Travel is more than a vacation. When disabled travelers book flights, roll into hotels, and explore new destinations, we are doing more than just getting away, we are showing up.</p>
        <p>The more we are out in the world, the more accessible the world will have to become.</p>
        <p><strong>We deserve to travel. And we deserve to know what to expect when we get there.</strong></p>
      </section>
    </div>

   <section className={styles.ctaSection}>
     <div className={styles.ctaInner}>
       <h2>Ready to Explore?</h2>
       <p>
         Browse destinations or share your experience to help build a clearer picture of accessibility around the world.
       </p>
       <div className={styles.ctaButtons}>
         <Link href="/destinations" className={styles.primaryButton}>
           Explore Destinations
         </Link>
         <Link href="/submitreview" className={styles.secondaryButton}>
           Submit a Review
         </Link>
       </div>
     </div>
   </section> 
    <Footer />
   </>
  );
} 


