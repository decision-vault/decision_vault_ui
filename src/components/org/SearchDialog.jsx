import React, { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex, Text, Kbd, Theme } from "@radix-ui/themes";
import {
  Search,
  Code,
  Plus,
  Building,
  Wrench,
  TableProperties,
  Keyboard,
} from "lucide-react";

// Injected CSS for clean layouts, transitions, and native portal overrides
const styles = `
  .command-overlay {
    animation: fadeIn 0.15s ease-out forwards;
    backdrop-filter: blur(4px);
  }
  
  .command-content {
    animation: slideUpFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .command-item {
    transition: background-color 0.1s ease, color 0.1s ease, transform 0.05s ease;
  }

  .command-item[data-active="true"] {
    background-color: var(--blue-3) !important;
    color: var(--blue-11) !important;
  }

  .command-item[data-active="true"] .icon-box {
    color: var(--blue-11) !important;
  }
  
  .command-item:active {
    transform: scale(0.995);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUpFade {
    from { 
      opacity: 0; 
      transform: translate(-50%, -6px) scale(0.98); 
    }
    to { 
      opacity: 1; 
      transform: translate(-50%, 0) scale(1); 
    }
  }
`;

function SectionHeader({ children }) {
  return (
    <Text
      size="1"
      style={{
        color: "var(--gray-9)",
        letterSpacing: "0.06em",
        padding: "16px 16px 6px 16px",
        display: "block",
        textTransform: "uppercase",
        fontWeight: 600,
        fontSize: "10px",
      }}
    >
      {children}
    </Text>
  );
}

function CommandItem({ icon, label, shortcut, active, onClick, onMouseEnter }) {
  return (
    <Flex
      className="command-item"
      align="center"
      justify="between"
      data-active={active}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        padding: "10px 14px",
        margin: "2px 8px",
        borderRadius: "8px",
        cursor: "pointer",
        color: "var(--gray-11)",
        backgroundColor: "transparent",
      }}
    >
      <Flex align="center" gap="3">
        {icon && (
          <Box className="icon-box" style={{ color: "var(--gray-9)", display: "flex" }}>
            {icon}
          </Box>
        )}
        <Text size="2" weight={active ? "semibold" : "medium"}>
          {label}
        </Text>
      </Flex>
      {shortcut && (
        <Kbd
          size="1"
          style={{
            color: active ? "var(--blue-11)" : "var(--gray-10)",
            backgroundColor: active ? "var(--blue-4)" : "var(--gray-2)",
            border: active ? "1px solid var(--blue-5)" : "1px solid var(--gray-5)",
            fontFamily: "inherit",
            boxShadow: "none",
          }}
        >
          {shortcut}
        </Kbd>
      )}
    </Flex>
  );
}

export default function SearchDialog({ open, onOpenChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Command configurations array matrix mapping actions
  const commandItems = [
    { id: "shortcuts", section: "Shortcuts", label: "Show all keyboard shortcuts", shortcut: "⇧?", icon: <Keyboard size={16} strokeWidth={2} />, action: () => console.log("Shortcuts clicked") },
    { id: "sql", section: "Queries", label: "Run SQL Query", icon: <Code size={16} strokeWidth={2} />, action: () => console.log("SQL run") },
    { id: "create", section: "Actions", label: "Create New Entry...", icon: <Plus size={16} strokeWidth={2} />, action: () => console.log("Create triggered") },
    { id: "org", section: "Actions", label: "Configure organization settings...", icon: <Building size={16} strokeWidth={2} />, action: () => console.log("Org clicked") },
    { id: "project", section: "Actions", label: "Switch project workspace...", icon: <Wrench size={16} strokeWidth={2} />, action: () => console.log("Switch project triggered") },
    { id: "tables", section: "Table Editor", label: "View schemas and data tables", icon: <TableProperties size={16} strokeWidth={2} />, action: () => console.log("View tables triggered") }
  ];

  // Filters commands reactively by input parameters match
  const filteredItems = commandItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset indices active index cleanly when searching updates lists layout
  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  // Handle standard element focus correction loops when DOM builds or mounts
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  // Keyboard capture navigation cycle loop
  useEffect(() => {
    if (!open || filteredItems.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[activeIndex]) {
          filteredItems[activeIndex].action();
          if (onOpenChange) onOpenChange(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, activeIndex, filteredItems, onOpenChange]);

  const renderSections = () => {
    if (filteredItems.length === 0) {
      return (
        <Flex align="center" justify="center" style={{ padding: "40px 16px" }}>
          <Text size="2" color="gray" style={{ color: "var(--gray-8)" }}>
            No results match your system criteria filter.
          </Text>
        </Flex>
      );
    }

    let lastSection = null;
    return filteredItems.map((item, index) => {
      const showHeader = item.section !== lastSection;
      if (showHeader) lastSection = item.section;

      return (
        <Box key={item.id}>
          {showHeader && <SectionHeader>{item.section}</SectionHeader>}
          <CommandItem
            icon={item.icon}
            label={item.label}
            shortcut={item.shortcut}
            active={index === activeIndex}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => {
              item.action();
              if (onOpenChange) onOpenChange(false);
            }}
          />
        </Box>
      );
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <style>{styles}</style>

      <Dialog.Portal>
        {/*  Enforces perfect Radix Theme Context Injection right into the Body Element Portal layer */}
        <Theme appearance="inherit" accentColor="blue" grayColor="slate" panelBackground="translucent">
          
          <Dialog.Overlay
            className="command-overlay"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.3)", // Slate overlay layer blending with Tailwind background layouts
              zIndex: 9999,
            }}
          />
          
          <Dialog.Content
            className="command-content"
            style={{
              position: "fixed",
              top: "12vh",
              left: "50%",
              transform: "translate(-50%, 0)",
              width: "calc(100% - 32px)",
              maxWidth: "600px",
              background: "var(--gray-1)",
              borderRadius: "14px",
              boxShadow: "0 0 0 1px var(--gray-4), 0 24px 60px -12px rgba(0,0,0,0.18), 0 12px 24px -4px rgba(0,0,0,0.06)",
              zIndex: 10000,
              outline: "none",
              display: "flex",
              flexDirection: "column",
              maxHeight: "75vh",
              overflow: "hidden",
              fontFamily: "var(--default-font-family)", // Plugs straight into index.css font arrays configuration variables
            }}
          >
            <Dialog.Title style={{ display: "none" }}>Search Palette Command Menu</Dialog.Title>

            {/* Input Entry Module */}
            <Flex
              align="center"
              gap="3"
              px="4"
              style={{ 
                borderBottom: "1px solid var(--gray-4)",
                height: "56px",
                flexShrink: 0
              }}
            >
              <Search size={18} color="var(--gray-9)" strokeWidth={2.5} />
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command filter sequence..."
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  fontSize: "15px",
                  fontWeight: "500",
                  color: "var(--gray-12)",
                  background: "transparent",
                  width: "100%",
                }}
              />
              <Kbd size="1" style={{ color: "var(--gray-8)", backgroundColor: "var(--gray-3)", boxShadow: "none" }}>
                ESC
              </Kbd>
            </Flex>

            {/* Active View lane scrolling layout area */}
            <Box 
              ref={listContainerRef}
              style={{ 
                paddingBottom: "12px", 
                overflowY: "auto", 
                background: "var(--gray-1)" 
              }}
            >
              {renderSections()}
            </Box>

            {/* Command Navigation Keyboard Footer */}
            <Flex
              align="center"
              justify="end"
              gap="4"
              px="4"
              style={{
                height: "38px",
                background: "var(--gray-2)",
                borderTop: "1px solid var(--gray-4)",
                flexShrink: 0,
              }}
            >
              <Flex align="center" gap="1">
                <Text size="1" style={{ color: "var(--gray-8)", fontSize: "11px" }}>Navigate</Text>
                <Kbd size="1" style={{ fontSize: "9px", padding: "1px 4px", boxShadow: "none" }}>↑↓</Kbd>
              </Flex>
              <Flex align="center" gap="1">
                <Text size="1" style={{ color: "var(--gray-8)", fontSize: "11px" }}>Select</Text>
                <Kbd size="1" style={{ fontSize: "9px", padding: "1px 4px", boxShadow: "none" }}>↵</Kbd>
              </Flex>
            </Flex>

          </Dialog.Content>
        </Theme>
      </Dialog.Portal>
    </Dialog.Root>
  );
}