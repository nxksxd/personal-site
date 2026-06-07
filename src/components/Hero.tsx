import "./Hero.css";

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero__bg-blur" />
      <div className="hero__content">
        <div className="hero__avatar">N</div>
        <h1 className="hero__name">nxksxd</h1>
        <p className="hero__tagline">
          Разработчик &middot; iOS &middot; Web &middot; Open Source
        </p>
        <p className="hero__bio">
          Создаю приложения и инструменты, которые упрощают жизнь. Люблю чистый
          код, красивый дизайн и автоматизацию.
        </p>
      </div>
    </section>
  );
}
