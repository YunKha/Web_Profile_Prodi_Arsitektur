import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge, Container, SectionHeading } from '../src/components/ui/primitives'

describe('primitives', () => {
  it('Badge renders correctly', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeTruthy()
  })
  
  it('Container renders correctly', () => {
    render(<Container>Test Container</Container>)
    expect(screen.getByText('Test Container')).toBeTruthy()
  })
  
  it('SectionHeading renders correctly', () => {
    render(<SectionHeading title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeTruthy()
  })
})
