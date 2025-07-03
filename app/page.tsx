import { Metadata } from 'next';
import Navbar from '@/client/src/components/layout/navbar';
import Footer from '@/client/src/components/layout/footer';
import HeroSection from '@/client/src/components/home/hero-section';
import AboutSection from '@/client/src/components/home/about-section';
import SkillsSection from '@/client/src/components/home/skills-section';
import ProjectsSection from '@/client/src/components/home/projects-section';
import ExperienceSection from '@/client/src/components/home/experience-section';
import ContactSection from '@/client/src/components/home/contact-section';

export const metadata: Metadata = {
  title: 'Home | Personal Portfolio',
  description: 'Welcome to my professional portfolio showcasing my skills, projects, and experience in web development.',
  openGraph: {
    title: 'Personal Portfolio | Web Developer & Designer',
    description: 'Discover my projects, skills and professional experience in web development and design.',
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}