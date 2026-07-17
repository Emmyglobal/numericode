export type ResourceType = 'pdf' | 'video' | 'link'
export interface ResourceItem { id: string; courseId: string; courseTitle: string; title: string; type: ResourceType; url: string }
