// Framer Motion's animation features, split into their own chunk so they load
// after the page is interactive (see MotionProvider). domMax rather than
// domAnimation because the site uses `layout` and `drag`.
import { domMax } from 'framer-motion';

export default domMax;
