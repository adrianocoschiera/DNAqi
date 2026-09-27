const translations = {
  en: {
    navProject: "The project", navModules: "Modules", navAward: "2026 project",
    heroEyebrow: "TECHNOLOGY THAT ADAPTS TO THE PERSON",
    heroTitle: "Everyone has their own way of communicating. <em>DNAqi learns to respect it.</em>",
    heroLead: "A customisable assistive environment connecting tablet, accessible communication and social robotics to support choice, learning and autonomy.",
    discover: "Discover the 2026 project", meetCustode: "Meet CUSTODE", projectBy: "A PROJECT BY", realPrototype: "CUSTODE PROTOTYPE · DNAqi OS", statPerson: "The person at the centre", statModules: "Adaptable modules", statOpen: "Open architecture",
    projectEyebrow: "WHY DNAqi", projectTitle: "Not the same activity for everyone.<br>An environment that can adapt.",
    projectText: "DNAqi grows from a family's daily experience and the need to connect tools that often remain separate: communication, learning, play, observation and relationships.",
    cardCommunicationTitle: "Accessible communication", cardCommunicationText: "Words, images, gestures and buttons can coexist in the same pathway.",
    cardLearningTitle: "Gradual learning", cardLearningText: "Structured activities with adjustable difficulty, timing and support.",
    cardDataTitle: "Understandable data", cardDataText: "Useful results for families and professionals, with respect for privacy.",
    prototypeStatus: "ACTIVE PROTOTYPE", custodeEyebrow: "DNAqi'S FIRST BODY",
    custodeLead: "An assistive social robot built to explore more natural, accessible and measurable interactions.",
    custodeText: "CUSTODE integrates voice, screen, movement, computer vision and communication tools. The prototype is real and evolving: every function is tested progressively, carefully and transparently.",
    featureVoice: "Voice and guided interaction", featureVision: "Privacy-conscious computer vision", featureMovement: "Robotic movement and expression", featureTablet: "Tablet control",
    notice: "DNAqi is an experimental assistive project: it does not diagnose and does not replace healthcare or education professionals.",
    modulesEyebrow: "ONE SYSTEM, MANY PATHWAYS", modulesTitle: "Modules that work together", modulesText: "Each component can work independently or connect to the others through DNAqi.",
    moduleCaa: "Communication", moduleCaaText: "Expressing needs, preferences, emotions and requests for help.", moduleLearning: "Learning", moduleLearningText: "Activities graded by age, timing and ability.",
    modulePlay: "Logic", modulePlayText: "Associations, sequences, memory and problem solving.", moduleStories: "Autonomy", moduleStoriesText: "Routines, choices and daily living activities.",
    moduleObservation: "Creativity", moduleObservationText: "Stories, drawing, music and self-expression.", moduleRobot: "Movement", moduleRobotText: "Accessible, guided and adaptable motor activities.",
    platformEyebrow: "THE PLATFORM AT A GLANCE", platformTitle: "Six areas, one profile", platformText: "Communication, learning, logic, autonomy, creativity and movement share the same architecture and the authorised profile settings.", conceptCaption: "DNAqi Junior interface · working tablet prototype.",
    roadmapEyebrow: "FROM PROTOTYPE TO COMMUNITY", roadmapTitle: "Transparent growth, one step at a time.", complete: "COMPLETED", inProgress: "IN DEVELOPMENT", nextGoal: "NEXT GOAL", vision: "VISION",
    roadOne: "First working prototype", roadOneText: "Hardware, DNAqi system and tablet control.", roadTwo: "Technical and functional testing", roadTwoText: "Tablet, profile, voice, activities, vision and movements are being progressively verified.",
    roadThree: "Shared pilot phase", roadThreeText: "Protocols, consent, safety and initial feedback with families and professionals.", roadFour: "Open platform", roadFourText: "A community developing and sharing new modules.",
    supportEyebrow: "HELP US TAKE THE NEXT STEP", supportTitle: "CUSTODE already exists.<br>Now we want it to help more people.", supportText: "We are preparing the next phase: enhanced safety, new modules, open documentation, and trials with families and professionals.",
    donate: "Support the project", contact: "Let's talk", footerText: "An independent project by I Custodi del DNA."
  }
};

const original = {};
document.querySelectorAll("[data-i18n]").forEach((el) => { original[el.dataset.i18n] = el.innerHTML; });

const languageButton = document.querySelector(".language-button");
let language = "it";
languageButton.addEventListener("click", () => {
  language = language === "it" ? "en" : "it";
  const dictionary = language === "en" ? translations.en : original;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = dictionary[el.dataset.i18n];
    if (value) el.innerHTML = value;
  });
  document.documentElement.lang = language;
  languageButton.innerHTML = language === "it"
    ? '<span class="active-lang">IT</span><span aria-hidden="true">/</span><span>EN</span>'
    : '<span>IT</span><span aria-hidden="true">/</span><span class="active-lang">EN</span>';
});

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-nav");
menuButton.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
document.getElementById("year").textContent = new Date().getFullYear();
