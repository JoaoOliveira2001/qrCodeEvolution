document.addEventListener("DOMContentLoaded", function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  document
    .querySelectorAll(".feature-card, .menu-item, .testimonial")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(50px)";
      observer.observe(el);
    });

  // Simula envio de formulário
  const form = document.querySelector(".contact-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Mensagem enviada com sucesso! Obrigado pelo contato.");
    form.reset();
  });
});
