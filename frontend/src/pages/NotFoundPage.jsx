import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="message-page"><span className="message-icon"><Compass size={28} /></span><p className="eyebrow">404 · PAGE NOT FOUND</p><h1>Looks like you’ve<br />missed a class.</h1><p>We couldn’t find the page you were looking for. Let’s get you back on track.</p><Link className="button button-primary" to="/">Return home</Link></div>;
}
