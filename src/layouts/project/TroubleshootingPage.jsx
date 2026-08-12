import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Flex, Heading, Text, Button, Badge, Card, TextField, Spinner, Separator,
} from '@radix-ui/themes';
import { Search, ChevronDown, HelpCircle, LifeBuoy, Inbox } from 'lucide-react';
import { getTroubleshootingArticles } from '../../services/troubleshootingApi';
import FeedbackDialog from '../../components/org/FeedbackDialog';

const CATEGORY_LABELS = {
  general: 'General',
  account: 'Account',
  billing: 'Billing',
  projects: 'Projects',
  ai_generation: 'AI generation',
  integrations: 'Integrations',
};

export default function TroubleshootingPage() {
  const { orgId } = useParams();

  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const load = React.useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await getTroubleshootingArticles(orgId);
      setArticles(data?.articles || []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load troubleshooting articles');
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((article) => {
      if (category !== 'all' && article.category !== category) return false;
      if (!q) return true;
      const haystack = [article.title, article.summary, ...(article.tags || [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [articles, query, category]);

  const counts = useMemo(() => {
    const map = {};
    for (const a of articles) map[a.category] = (map[a.category] || 0) + 1;
    return map;
  }, [articles]);

  return (
    <Box style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }} px="4" py="4">
      {/* Page Header */}
      <Flex justify="between" align="center" wrap="wrap" gap="3" mb="4">
        <Box>
          <Heading size="6" weight="bold">Troubleshooting</Heading>
          <Text size="2" color="gray" mt="1">
            Fix common DecisionVault issues — search by symptom, keyword, or category.
          </Text>
        </Box>

        <Button
          size="2"
          variant="soft"
          color="gray"
          style={{ fontWeight: '500', cursor: 'pointer' }}
          onClick={() => setFeedbackOpen(true)}
        >
          <LifeBuoy size={14} /> Still stuck? Report an issue
        </Button>
      </Flex>

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        orgId={orgId}
      />

      {/* Search */}
      <TextField.Root
        size="2"
        mb="4"
        placeholder="Search troubleshooting articles…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      >
        <TextField.Slot>
          <Search size={14} color="var(--gray-9)" />
        </TextField.Slot>
      </TextField.Root>

      {/* Category chips */}
      <Flex gap="2" mb="4" wrap="wrap">
        <Button
          size="1"
          variant={category === 'all' ? 'solid' : 'soft'}
          color={category === 'all' ? 'blue' : 'gray'}
          style={{ cursor: 'pointer' }}
          onClick={() => setCategory('all')}
        >
          All ({articles.length})
        </Button>
        {Object.keys(CATEGORY_LABELS).map((cat) => (
          <Button
            key={cat}
            size="1"
            variant={category === cat ? 'solid' : 'soft'}
            color={category === cat ? 'blue' : 'gray'}
            style={{ cursor: 'pointer' }}
            onClick={() => setCategory(cat)}
          >
            {CATEGORY_LABELS[cat]} ({counts[cat] || 0})
          </Button>
        ))}
      </Flex>

      <Separator orientation="horizontal" mb="4" />

      {/* Articles */}
      {isLoading ? (
        <Flex justify="center" align="center" p="6">
          <Spinner size="3" />
        </Flex>
      ) : loadError ? (
        <Flex direction="column" align="center" gap="3" p="6">
          <Text size="2" color="red">{loadError}</Text>
          <Button variant="soft" color="gray" size="2" style={{ cursor: 'pointer' }} onClick={() => load()}>
            Retry
          </Button>
        </Flex>
      ) : filtered.length === 0 ? (
        <Flex direction="column" align="center" justify="center" gap="3" p="8" style={{ border: '1px dashed var(--gray-5)', borderRadius: 'var(--radius-3)', background: 'var(--gray-2)' }}>
          <Inbox size={24} color="var(--gray-7)" />
          <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>No articles match your search</Text>
          <Text size="1" color="gray">Try a different keyword or clear the category filter.</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="2">
          {filtered.map((article) => {
            const isOpen = expanded === article.id;
            return (
              <Card
                key={article.id}
                size="1"
                style={{ background: 'var(--color-panel-solid)', cursor: 'pointer' }}
                onClick={() => setExpanded(isOpen ? null : article.id)}
              >
                <Flex align="start" justify="between" gap="3" p="1">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Flex align="center" gap="2" mb="1">
                      <Box style={{ color: 'var(--gray-9)', display: 'flex', alignItems: 'center' }}>
                        <HelpCircle size={14} />
                      </Box>
                      <Badge size="1" color="gray" variant="soft" radius="full">
                        {CATEGORY_LABELS[article.category] || article.category}
                      </Badge>
                    </Flex>
                    <Text size="2" weight="bold" style={{ color: 'var(--gray-12)' }}>
                      {article.title}
                    </Text>
                    <Text size="2" color="gray" mt="1" style={{ display: 'block' }}>
                      {article.summary}
                    </Text>

                    {isOpen && (article.steps || []).length > 0 && (
                      <Box mt="3" pl="2" style={{ borderLeft: '2px solid var(--gray-5)' }}>
                        {(article.steps || []).map((step, idx) => (
                          <Flex key={idx} align="start" gap="2" mb="1">
                            <Text size="1" weight="bold" color="gray" style={{ flexShrink: 0, marginTop: 2 }}>
                              {idx + 1}.
                            </Text>
                            <Text size="2" style={{ color: 'var(--gray-12)', lineHeight: '1.5' }}>
                              {step}
                            </Text>
                          </Flex>
                        ))}
                      </Box>
                    )}
                  </Box>

                  <ChevronDown
                    size={16}
                    color="var(--gray-8)"
                    style={{ flexShrink: 0, marginTop: 4, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
                  />
                </Flex>
              </Card>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
