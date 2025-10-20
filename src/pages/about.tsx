import React from "react";
import "../styles/about.sass";

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

const About: React.FC = () => {
  const team: TeamMember[] = [
    {
      name: "Joshua Arciniegas",
      role: "Desarrollador Frontend",
      image: "/images/joshuafoto.jpeg",
    },
    {
      name: "Alejandra Giraldo",
      role: "Tester & QA",
      image: "/images/alejandrafoto.jpeg",
    },
    {
      name: "Daniela Chanchi",
      role: "Desarrollador BD",
      image: "/images/danielafoto.jpeg",
    },
    {
      name: "Gean Franco Muñoz",
      role: "Desarrollador Backend",
      image: "/images/geanfoto.jpeg",
    },
    {
      name: "Diego Alejandro Chinome",
      role: "Gestor de proyecto",
      image: "/images/diego.jpeg",
    },
  ];

  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="title">Sobre Nosotros</h1>

        <p className="intro">
          En <strong>MovieWave</strong>, somos un equipo apasionado por el cine y la tecnología.
          Nuestra misión es ofrecerte una plataforma moderna, intuitiva y rápida para explorar,
          descubrir y disfrutar tus películas favoritas.
        </p>

        <div className="about-sections">
          <div className="card">
            <h2>Nuestra Visión</h2>
            <p>
              Convertirnos en la plataforma líder de descubrimiento cinematográfico,
              inspirando a las personas a conectar con historias que trascienden fronteras.
            </p>
          </div>

          <div className="card">
            <h2>Nuestra Misión</h2>
            <p>
              Ofrecer una experiencia personalizada y fluida, impulsada por la innovación
              tecnológica y el amor por el séptimo arte.
            </p>
          </div>

          <div className="card">
            <h2>El Equipo</h2>
            <p>
              MovieWave nació gracias al esfuerzo de un grupo de desarrolladores, diseñadores
              y amantes del cine que buscan crear algo diferente. 🌊🎬
            </p>
          </div>
        </div>

        <h2 className="subtitle">Conoce a nuestro equipo</h2>

        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <img src={member.image} alt={member.name} className="team-photo" />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>

        <p className="closing">
          Gracias por ser parte de nuestra comunidad. 💙  
          ¡Tu próxima película favorita te está esperando!
        </p>
      </div>
    </div>
  );
};

export default About;
