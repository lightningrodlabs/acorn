import { useStore } from 'react-redux'
import exportProjectsData from '../src/migrating/export'

describe('test export functionality', () => {
  it('should return projects data', async () => {
    const result = await exportProjectsData(useStore(), 'test', (_, __) => {})
    console.log(result)
  })
})
