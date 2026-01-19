// ABOUTME: Initial test file to verify Jest is configured correctly.
// ABOUTME: Contains basic sanity checks for the test infrastructure.

describe('Jest Setup', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true)
  })

  it('should perform basic arithmetic', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  it('should handle objects', () => {
    const obj = { name: 'ProTempo', version: '1.0.0' }
    expect(obj).toHaveProperty('name')
    expect(obj.name).toBe('ProTempo')
  })

  it('should handle async operations', async () => {
    const asyncFn = async (): Promise<string> => {
      return 'async result'
    }
    const result = await asyncFn()
    expect(result).toBe('async result')
  })
})
