const bookingFrame = document.querySelector("[data-booking-frame]");
const bookingChoices = document.querySelectorAll("[data-booking-choice]");

function selectConversation(choice) {
  const link = [...bookingChoices].find((item) => item.dataset.bookingChoice === choice);
  if (!bookingFrame || !link) return;

  bookingFrame.src = link.dataset.bookingUrl;
  document.querySelectorAll("[data-booking-option]").forEach((option) => {
    option.dataset.selected = option.dataset.bookingOption === choice ? "true" : "false";
  });
  bookingChoices.forEach((item) => {
    if (item === link) item.setAttribute("aria-current", "true");
    else item.removeAttribute("aria-current");
  });
}

bookingChoices.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    selectConversation(link.dataset.bookingChoice);
    document.querySelector("#booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const requestedConversation = new URLSearchParams(window.location.search).get("conversation");
if (requestedConversation) selectConversation(requestedConversation);
