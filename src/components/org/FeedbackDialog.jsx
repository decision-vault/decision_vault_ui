import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Flex, Text, Box, Theme, IconButton, TextArea, Button, Spinner } from "@radix-ui/themes";
import { AlertTriangle, Lightbulb, X, ArrowLeft } from "lucide-react";
import { useToast } from "../Toast";
import { submitFeedback } from "../../services/feedbackApi";

const styles = `
  .feedback-content {
    animation: feedbackSlideDown 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  .feedback-card {
    transition: all 0.12s ease;
    border: 1px solid var(--gray-5);
    background: var(--gray-1);
    cursor: pointer;
  }
  
  .feedback-card:hover {
    border-color: var(--blue-8);
    background: var(--blue-2);
  }

  .feedback-card:active {
    transform: scale(0.98);
  }

  @keyframes feedbackSlideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TYPE_META = {
  issue: { label: "Issue", placeholder: "Describe the issue you're running into..." },
  idea: { label: "Idea", placeholder: "Tell us what would make this better..." },
};

export default function FeedbackDialog({ open, onOpenChange, orgId, onSubmitted }) {
  const toast = useToast();

  const [step, setStep] = useState("select");
  const [type, setType] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStep("select");
      setType(null);
      setMessage("");
      setError("");
    }
  }, [open]);

  const handleSelect = (selectedType) => {
    setType(selectedType);
    setMessage("");
    setError("");
    setStep("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !message.trim()) {
      setError("Please describe what you'd like to share.");
      return;
    }
    if (!orgId) {
      setError("Missing organization context. Please try again.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await submitFeedback(orgId, { type, message });
      toast.success(
        type === "issue" ? "Issue submitted" : "Idea submitted",
        "Thanks — it's been recorded for this organization."
      );
      onSubmitted?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <style>{styles}</style>
      <Dialog.Portal>
        <Theme appearance="inherit">
          <Dialog.Overlay
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              pointerEvents: "auto",
            }}
          />

          <Dialog.Content
            className="feedback-content"
            onInteractOutside={() => onOpenChange(false)}
            style={{
              position: "fixed",
              top: "68px",
              right: "24px",
              width: "440px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 0 0 1px var(--gray-4), 0 16px 40px -10px rgba(0,0,0,0.12), 0 8px 16px -4px rgba(0,0,0,0.04)",
              zIndex: 1000,
              outline: "none",
              padding: "20px",
              fontFamily: "var(--default-font-family)",
            }}
          >
            {/* Header / Title block */}
            <Flex justify="between" align="center" mb="4">
              <Flex align="center" gap="2">
                {step === "form" && (
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    style={{ cursor: "pointer" }}
                    onClick={() => { setStep("select"); setError(""); }}
                  >
                    <ArrowLeft size={14} />
                  </IconButton>
                )}
                <Dialog.Title style={{ margin: 0 }}>
                  <Text size="2" weight="bold" style={{ color: "var(--gray-12)" }}>
                    What would you like to share?
                  </Text>
                </Dialog.Title>
              </Flex>
              <Dialog.Close asChild>
                <IconButton size="1" variant="ghost" color="gray" style={{ cursor: "pointer" }}>
                  <X size={14} />
                </IconButton>
              </Dialog.Close>
            </Flex>

            {step === "select" ? (
              /* ── Selection Options Grid ─────────────────────────────── */
              <Flex gap="3">
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  className="feedback-card"
                  style={{ flex: 1, padding: "20px 12px", borderRadius: "10px" }}
                  onClick={() => handleSelect("issue")}
                >
                  <Box style={{ color: "#c2410c", marginBottom: "8px" }}>
                    <AlertTriangle size={24} strokeWidth={2} />
                  </Box>
                  <Text size="2" weight="bold" style={{ color: "var(--gray-12)" }}>
                    Issue
                  </Text>
                  <Text size="1" align="center" style={{ color: "var(--gray-9)", marginTop: "2px" }}>
                    with my project
                  </Text>
                </Flex>

                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  className="feedback-card"
                  style={{ flex: 1, padding: "20px 12px", borderRadius: "10px" }}
                  onClick={() => handleSelect("idea")}
                >
                  <Box style={{ color: "#b45309", marginBottom: "8px" }}>
                    <Lightbulb size={24} strokeWidth={2} />
                  </Box>
                  <Text size="2" weight="bold" style={{ color: "var(--gray-12)" }}>
                    Idea
                  </Text>
                  <Text size="1" align="center" style={{ color: "var(--gray-9)", marginTop: "2px" }}>
                    to improve project
                  </Text>
                </Flex>
              </Flex>
            ) : (
              /* ── Detail form step ───────────────────────────────────── */
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="3">
                  <Flex align="center" gap="2">
                    <Box style={{ color: type === "issue" ? "#c2410c" : "#b45309" }}>
                      {type === "issue" ? <AlertTriangle size={16} strokeWidth={2} /> : <Lightbulb size={16} strokeWidth={2} />}
                    </Box>
                    <Text size="2" weight="bold" style={{ color: "var(--gray-12)" }}>
                      {TYPE_META[type]?.label || "Feedback"}
                    </Text>
                  </Flex>

                  <TextArea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={TYPE_META[type]?.placeholder}
                    rows={5}
                    style={{ resize: "vertical" }}
                  />

                  {error && (
                    <Text size="1" color="red" style={{ display: "block" }}>
                      {error}
                    </Text>
                  )}

                  <Flex justify="end" gap="2" mt="1">
                    <Button
                      size="2"
                      variant="soft"
                      color="gray"
                      type="button"
                      style={{ cursor: "pointer" }}
                      onClick={() => { setStep("select"); setError(""); }}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button size="2" variant="solid" type="submit" style={{ cursor: "pointer" }} disabled={isSubmitting}>
                      {isSubmitting ? <Spinner size="1" /> : "Submit"}
                    </Button>
                  </Flex>
                </Flex>
              </form>
            )}
          </Dialog.Content>
        </Theme>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
