export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  export function truncateText(text: string, maxLength: number = 50) {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }
  
  export function generateChatTitle(firstMessage: string) {
    const title = truncateText(firstMessage, 30)
    return title || 'New Chat'
  }