import { useParams } from 'react-router-dom'
import { MvpDocViewPage } from './MvpDocViewPage'
import { SchemaFlowPage } from './schema/SchemaFlowPage'
import { SequenceDiagramPage } from './mermaid/SequenceDiagramPage'
import { ArchitectureDiagramPage } from './mermaid/ArchitectureDiagramPage'
import { TaskBreakdownPage } from './tasks/TaskBreakdownPage'

/** Renders the correct MVP step view: doc, schema flow, sequence diagrams, architecture diagrams, or task breakdown. */
export function MvpStepPage() {
  const { stepIndex } = useParams()
  if (stepIndex === '2') return <SchemaFlowPage />
  if (stepIndex === '3') return <SequenceDiagramPage />
  if (stepIndex === '4') return <ArchitectureDiagramPage />
  if (stepIndex === '8') return <TaskBreakdownPage />
  return <MvpDocViewPage />
}
