import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return <div className="message-page"><span className="message-icon danger"><ShieldAlert size={28} /></span><p className="eyebrow">ACCESS RESTRICTED</p><h1>This page isn’t<br />in your workspace.</h1><p>Your account doesn’t have permission to view this page. If you think this is a mistake, contact your administrator.</p><Link className="button button-primary" to="/">Back to sign in</Link></div>;
}
