import { useState } from 'react'
import './App.css'

const Card = ({ title, likes, onLike }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <button onClick={onLike}>{title}</button>
      <p>Likes: {likes}</p>
    </div>
  )
}

const App = () => {
  const [hasLiked, setHasLiked] = useState(0)

  return (
    <div className="card-container">
      <Card title="wakanda" likes={hasLiked} onLike={() => setHasLiked(hasLiked + 1)} />
      <Card title="avatar" likes={0} onLike={() => {}} />
      <Card title="vampire diaries" likes={0} onLike={() => {}} />
      <Card title="star wars" likes={9} onLike={() => {}} />
    </div>
  )
}

export default App