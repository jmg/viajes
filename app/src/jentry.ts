// Primer import de main.tsx: el SDK queda andando antes de que se evalúe el
// resto de la app, así que también un error al cargar un módulo llega a Jentry.
import { iniciarJentry } from "./lib/jentry";

iniciarJentry();
