'use client'

import { useState } from 'react'
import { X, Delete } from 'lucide-react'

interface SimpleCalculatorProps {
  onClose: () => void
}

export default function SimpleCalculator({ onClose }: SimpleCalculatorProps) {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '*':
        return firstValue * secondValue
      case '/':
        return firstValue / secondValue
      case '%':
        return firstValue % secondValue
      default:
        return secondValue
    }
  }

  const handleEquals = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }

  const buttons = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['C', '0', '.', '+'],
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Kalkulačka</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Display */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="text-right">
              {operation && previousValue !== null && (
                <div className="text-sm text-gray-500 mb-1">
                  {previousValue} {operation}
                </div>
              )}
              <div className="text-3xl font-bold text-gray-900 break-all">
                {display}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            {/* Number and operation buttons */}
            {buttons.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-4 gap-2">
                {row.map((btn) => {
                  const isOperation = ['+', '-', '*', '/', '='].includes(btn)
                  const isEquals = btn === '='
                  const isClear = btn === 'C'

                  return (
                    <button
                      key={btn}
                      onClick={() => {
                        if (btn === 'C') {
                          clear()
                        } else if (btn === '=') {
                          handleEquals()
                        } else if (btn === '.') {
                          inputDecimal()
                        } else if (isOperation) {
                          performOperation(btn)
                        } else {
                          inputDigit(btn)
                        }
                      }}
                      className={`
                        py-4 rounded-lg font-semibold text-lg transition-colors
                        ${isClear
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : isEquals
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : isOperation
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        }
                      `}
                    >
                      {btn}
                    </button>
                  )
                })}
              </div>
            ))}

            {/* Equals and Percentage buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleEquals}
                className="py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg"
              >
                =
              </button>
              <button
                onClick={() => performOperation('%')}
                className="py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-lg"
              >
                %
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            Jednoduchá kalkulačka pro základní výpočty
          </div>
        </div>
      </div>
    </div>
  )
}

