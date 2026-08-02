"use client";

import { useEffect, useRef, useState } from "react";
import { emptyLead, submitLead } from "@/lib/lead";
import {
  CHAT_DISCLAIMER,
  CHAT_INTRO,
  HANDOFF,
  MAIN_OPTIONS,
  chatTopics,
} from "@/lib/chat";

/**
 * ChatWidget (build.md AI CHAT) — persistent mono launcher (not a bubble-with-emoji).
 * Scoped, no-LLM assistant: answers shop FAQs via quick replies, states up front it
 * isn't a team member, then collects name + phone and hands off through the SAME
 * lead pipeline as the Quote Builder (/api/lead, source: "chat").
 */
type Msg = { from: "bot" | "user"; text: string };
type Step = "menu" | "name" | "phone" | "sending" | "done";

const optionLabel = (id: string) =>
  id === HANDOFF ? "Talk to a human" : chatTopics[id].label;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("menu");
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("General enquiry");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const say = (msgs: Msg[]) => setMessages((prev) => [...prev, ...msgs]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
    if ((step === "name" || step === "phone") && open) inputRef.current?.focus();
  }, [messages, step, open]);

  const openPanel = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([
        { from: "bot", text: CHAT_DISCLAIMER },
        { from: "bot", text: CHAT_INTRO },
      ]);
      setOptions(MAIN_OPTIONS);
      setStep("menu");
    }
  };

  const startHandoff = () => {
    say([{ from: "bot", text: "Happy to connect you with the shop. What's your name?" }]);
    setOptions([]);
    setStep("name");
  };

  const pick = (id: string) => {
    if (id === HANDOFF) {
      say([{ from: "user", text: "Talk to a human" }]);
      startHandoff();
      return;
    }
    const topic = chatTopics[id];
    setInterest(topic.label);
    say([
      { from: "user", text: topic.label },
      { from: "bot", text: topic.answer },
    ]);
    setOptions(topic.followups);
    setStep("menu");
  };

  const send = async () => {
    const value = draft.trim();
    if (!value) return;

    if (step === "name") {
      setName(value);
      say([
        { from: "user", text: value },
        { from: "bot", text: `Thanks, ${value.split(" ")[0]}. What's the best phone number?` },
      ]);
      setDraft("");
      setStep("phone");
      return;
    }

    if (step === "phone") {
      if (value.replace(/\D/g, "").length < 10) {
        say([
          { from: "user", text: value },
          { from: "bot", text: "That doesn't look like a full number. Mind trying again?" },
        ]);
        setDraft("");
        return;
      }
      say([{ from: "user", text: value }]);
      setDraft("");
      setStep("sending");
      const res = await submitLead({
        ...emptyLead("chat"),
        contact: { name, phone: value },
        note: `Chat interest: ${interest}`,
      });
      if (res.ok) {
        say([
          {
            from: "bot",
            text: `Got it. Someone from Iqballaz will reach out about your ${interest.toLowerCase()}. For anything urgent, call (832) 208-1071.`,
          },
        ]);
        setStep("done");
      } else {
        say([
          {
            from: "bot",
            text: "Couldn't send that just now. Please call (832) 208-1071 and we'll take care of you.",
          },
        ]);
        setStep("done");
      }
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open ? (
        <div className="mb-3 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-media border border-line bg-black-raised">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="mono-label">Iqballaz Assistant</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mono-label text-muted hover:text-ink"
            >
              Close
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-media px-3 py-2 text-sm ${
                  m.from === "bot"
                    ? "border border-line bg-black text-ink"
                    : "ml-auto border border-red/60 text-ink"
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Footer — quick replies or capture input */}
          <div className="border-t border-line px-4 py-3">
            {step === "menu" && options.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {options.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pick(id)}
                    className="mono-label rounded-full border border-line px-3 py-1.5 text-ink transition-colors hover:border-red"
                  >
                    {optionLabel(id)}
                  </button>
                ))}
              </div>
            ) : null}

            {step === "name" || step === "phone" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  inputMode={step === "phone" ? "tel" : "text"}
                  placeholder={step === "name" ? "Your name" : "(832) 208-1071"}
                  className="w-full rounded-input border border-line bg-black px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-red"
                />
                <button
                  type="submit"
                  style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
                  className="btn-sweep mono-label bg-red px-4 py-2 text-ink"
                >
                  Send
                </button>
              </form>
            ) : null}

            {step === "sending" ? (
              <p className="mono-label text-muted">Sending…</p>
            ) : null}

            {step === "done" ? (
              <a href="/quote" className="link-underline mono-label text-ink">
                Or book an appointment →
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={openPanel}
          className="group flex w-56 flex-col gap-3 rounded-media border border-line bg-black-raised p-4 text-left"
        >
          <span className="text-sm text-ink">Got a build in mind?</span>
          <span className="mono-label inline-flex items-center gap-1.5 text-red transition-colors group-hover:text-ink">
            Ask Iqballaz <span aria-hidden="true">→</span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mono-label rounded-full border border-line bg-black-raised px-4 py-2 text-ink transition-colors hover:border-red"
        >
          Close
        </button>
      )}
    </div>
  );
}
