import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

const STORAGE_KEY = 'react-todo-list'

function loadTodos(): Todo[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Todo[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (t) =>
          typeof t === 'object' &&
          typeof t.id === 'string' &&
          typeof t.text === 'string',
      )
      .map((t) => ({
        id: t.id,
        text: t.text,
        completed: Boolean(t.completed),
        createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
      }))
  } catch {
    return []
  }
}

function saveTodos(todos: Todo[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    // ignore write errors
  }
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos())
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')



  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const remainingCount = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos],
  )

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed)
    if (filter === 'completed') return todos.filter((t) => t.completed)
    return todos
  }, [todos, filter])

  function handleAddTodo(e: React.FormEvent) {
    e.preventDefault()
    const text = newTodo.trim()
    if (!text) return
    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    }
    setTodos((prev) => [todo, ...prev])
    setNewTodo('')
  }

  function handleToggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  function handleDeleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function handleClearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo List</h1>
        <p className="subtitle">Simple React todos with localStorage</p>
        <p className="subtitle">React todo app (डेटा localStorage में सेव होता है)</p>
      </header>

      <main>
        <section className="card">
          <form className="todo-input-row" onSubmit={handleAddTodo}>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="todo-input"
              autoFocus
            />
            <button type="submit" className="primary-button">
              Add
            </button>
          </form>

          <div className="toolbar">
            <div className="filters">
              <button
                type="button"
                className={filter === 'all' ? 'chip chip-active' : 'chip'}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={filter === 'active' ? 'chip chip-active' : 'chip'}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button
                type="button"
                className={
                  filter === 'completed' ? 'chip chip-active' : 'chip'
                }
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
            <div className="toolbar-right">
              <span className="counter-text">
                {remainingCount} task{remainingCount === 1 ? '' : 's'} left
              </span>
              <button
                type="button"
                className="text-button"
                onClick={handleClearCompleted}
                disabled={!todos.some((t) => t.completed)}
              >
                Clear completed
              </button>
            </div>
          </div>

          {filteredTodos.length === 0 ? (
            <p className="empty-state">
              No todos yet. Start by adding a task above.
              <br />
              अभी कोई task नहीं है, ऊपर से add कीजिए।
            </p>
          ) : (
            <ul className="todo-list">
              {filteredTodos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  <label className="todo-label">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                    />
                    <span
                      className={
                        todo.completed ? 'todo-text todo-text-completed' : 'todo-text'
                      }
                    >
                      {todo.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Delete todo"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
