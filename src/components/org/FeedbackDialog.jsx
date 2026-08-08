import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Flex, Text, Box, Theme, IconButton } from "@radix-ui/themes";
import { AlertTriangle, Lightbulb, X } from "lucide-react";

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

export default function FeedbackDialog({ open, onOpenChange }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <style>{styles}</style>
      <Dialog.Portal>
        <Theme appearance="inherit">
          {/* 
             FIX: Updated styling to absolute click-through parameters. 
            This prevents transparent backdrops from locking mouse clicks on the page wrapper.
          */}
          <Dialog.Overlay 
            style={{ 
              position: "fixed", 
              inset: 0, 
              zIndex: 999,
              pointerEvents: "auto" /* Ensures clicking outside closes the menu box instantly */
            }} 
          />

          <Dialog.Content
            className="feedback-content"
            /* 
               FIX: Added onInteractOutside handler to cleanly intercept closing requests 
              without generating script crashes.
            */
            onInteractOutside={() => onOpenChange(false)}
            style={{
              position: "fixed",
              top: "68px", 
              right: "24px", /* Adjusted to position properly near the notification icons dock */
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
              <Dialog.Title style={{ margin: 0 }}>
                <Text size="2" weight="bold" style={{ color: "var(--gray-12)" }}>
                  What would you like to share?
                </Text>
              </Dialog.Title>
              <Dialog.Close asChild>
                <IconButton size="1" variant="ghost" color="gray" style={{ cursor: "pointer" }}>
                  <X size={14} />
                </IconButton>
              </Dialog.Close>
            </Flex>

            {/* Selection Options Grid */}
            <Flex gap="3">
              {/* Option 1: Issue Card */}
              <Flex
                direction="column"
                align="center"
                justify="center"
                className="feedback-card"
                style={{ flex: 1, padding: "20px 12px", borderRadius: "10px" }}
                onClick={() => {
                  console.log("Issue route initiated");
                  onOpenChange(false);
                }}
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

              {/* Option 2: Idea Card */}
              <Flex
                direction="column"
                align="center"
                justify="center"
                className="feedback-card"
                style={{ flex: 1, padding: "20px 12px", borderRadius: "10px" }}
                onClick={() => {
                  console.log("Idea route initiated");
                  onOpenChange(false);
                }}
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
          </Dialog.Content>
        </Theme>
      </Dialog.Portal>
    </Dialog.Root>
  );
}