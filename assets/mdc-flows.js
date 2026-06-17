/*
 * MALLORCA DELUXE Chatbot – Conversation flows & UI strings (DE / EN / ES)
 * ---------------------------------------------------------------------------
 * Single source of truth for the dialog graph. The structure is defined ONCE;
 * every piece of visible text carries its three translations inline ({de,en,es})
 * so the German master text and its EN/ES translations never drift apart.
 *
 * To adjust wording later, edit the {de,en,es} objects below – no engine changes
 * required. Values (the "v" of each option) are language-independent IDs and are
 * what gets stored / scored on the server, so do NOT rename them lightly.
 */
(function (w) {
  "use strict";

  var FLOWS = {
    version: "1.0.0",
    langs: ["de", "en", "es"],

    /* Entry node per page context. The engine picks one based on MDC_CONFIG.context */
    entries: { home: "home_entry", property: "property_entry" },

    /* ---------------------------------------------------------------------
     * UI strings (chrome around the conversation)
     * ------------------------------------------------------------------- */
    ui: {
      de: {
        subtitle: "Ihr persönlicher Immobilien-Concierge",
        launcherTeaser: "Wie darf ich Ihnen helfen?",
        online: "Antwortet sofort",
        back: "Zurück",
        next: "Weiter",
        send: "Absenden",
        multiHint: "Mehrfachauswahl möglich",
        selectAtLeastOne: "Bitte wählen Sie mindestens eine Option.",
        firstName: "Vorname",
        lastName: "Nachname",
        email: "E-Mail-Adresse",
        phone: "Telefonnummer",
        requiredField: "Pflichtfeld",
        fillField: "Bitte füllen Sie dieses Feld aus.",
        invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        invalidPhone: "Bitte geben Sie eine gültige Telefonnummer ein.",
        consentText: "Ja, ich habe die {privacy} gelesen und stimme der Verarbeitung meiner Angaben zur Kontaktaufnahme zu.",
        privacyText: "Datenschutzerklärung",
        consentRequired: "Bitte bestätigen Sie die Datenschutzerklärung, um fortzufahren.",
        whatsappBtn: "Direkt auf WhatsApp schreiben",
        whatsappPrefill: "Hallo MALLORCA DELUXE, ich habe gerade Ihren Chat ausgefüllt und freue mich auf Ihre Rückmeldung.",
        restart: "Neues Gespräch",
        close: "Schließen",
        open: "Chat öffnen",
        typing: "schreibt",
        sending: "Wird gesendet …",
        errorGeneric: "Es ist ein technischer Fehler aufgetreten. Bitte versuchen Sie es erneut.",
        langLabel: "Sprache"
      },
      en: {
        subtitle: "Your personal real-estate concierge",
        launcherTeaser: "How may I help you?",
        online: "Replies instantly",
        back: "Back",
        next: "Continue",
        send: "Submit",
        multiHint: "Multiple selection possible",
        selectAtLeastOne: "Please select at least one option.",
        firstName: "First name",
        lastName: "Last name",
        email: "Email address",
        phone: "Phone number",
        requiredField: "Required",
        fillField: "Please complete this field.",
        invalidEmail: "Please enter a valid email address.",
        invalidPhone: "Please enter a valid phone number.",
        consentText: "Yes, I have read the {privacy} and agree to my details being processed so you can contact me.",
        privacyText: "privacy policy",
        consentRequired: "Please accept the privacy policy to continue.",
        whatsappBtn: "Message us on WhatsApp",
        whatsappPrefill: "Hello MALLORCA DELUXE, I have just completed your chat and look forward to your reply.",
        restart: "New conversation",
        close: "Close",
        open: "Open chat",
        typing: "typing",
        sending: "Sending …",
        errorGeneric: "A technical error occurred. Please try again.",
        langLabel: "Language"
      },
      es: {
        subtitle: "Su conserje inmobiliario personal",
        launcherTeaser: "¿En qué puedo ayudarle?",
        online: "Responde al instante",
        back: "Atrás",
        next: "Continuar",
        send: "Enviar",
        multiHint: "Selección múltiple posible",
        selectAtLeastOne: "Seleccione al menos una opción.",
        firstName: "Nombre",
        lastName: "Apellidos",
        email: "Correo electrónico",
        phone: "Número de teléfono",
        requiredField: "Obligatorio",
        fillField: "Por favor, complete este campo.",
        invalidEmail: "Introduzca una dirección de correo electrónico válida.",
        invalidPhone: "Introduzca un número de teléfono válido.",
        consentText: "Sí, he leído la {privacy} y acepto el tratamiento de mis datos para que puedan contactarme.",
        privacyText: "política de privacidad",
        consentRequired: "Acepte la política de privacidad para continuar.",
        whatsappBtn: "Escríbanos por WhatsApp",
        whatsappPrefill: "Hola MALLORCA DELUXE, acabo de completar su chat y espero su respuesta.",
        restart: "Nueva conversación",
        close: "Cerrar",
        open: "Abrir chat",
        typing: "escribiendo",
        sending: "Enviando …",
        errorGeneric: "Se ha producido un error técnico. Inténtelo de nuevo.",
        langLabel: "Idioma"
      }
    },

    /* ---------------------------------------------------------------------
     * Conversation graph
     * ------------------------------------------------------------------- */
    nodes: {

      /* ===================== HOME ENTRY ===================== */
      home_entry: {
        type: "single",
        flow: "entry",
        key: "intent",
        bot: [{
          de: "Hallo, ich bin Matthias von MALLORCA DELUXE. Wie kann ich Ihnen behilflich sein?",
          en: "Hello, I'm Matthias from MALLORCA DELUXE. How can I help you?",
          es: "Hola, soy Matthias de MALLORCA DELUXE. ¿En qué puedo ayudarle?"
        }],
        options: [
          { v: "kaufen", l: { de: "Ich möchte kaufen", en: "I want to buy", es: "Quiero comprar" }, next: "b_purpose" },
          { v: "verkaufen", l: { de: "Ich möchte verkaufen", en: "I want to sell", es: "Quiero vender" }, next: "s_intro" }
        ]
      },

      /* ===================== BUYER FLOW ===================== */
      /* Phase 1 – Motivation & Emotion */
      b_purpose: {
        type: "single", flow: "buyer", key: "purpose",
        bot: [{
          de: "Wunderbar. Was suchen Sie auf Mallorca?",
          en: "Wonderful. What are you looking for on Mallorca?",
          es: "Maravilloso. ¿Qué busca en Mallorca?"
        }],
        options: [
          { v: "ferienimmobilie", l: { de: "Ferienimmobilie", en: "Holiday property", es: "Propiedad vacacional" } },
          { v: "dauerwohnsitz", l: { de: "Dauerwohnsitz", en: "Permanent residence", es: "Residencia permanente" } },
          { v: "zweitwohnsitz", l: { de: "Zweitwohnsitz", en: "Second home", es: "Segunda residencia" } },
          { v: "investment", l: { de: "Investment", en: "Investment", es: "Inversión" } },
          { v: "offen", l: { de: "Ich bin noch offen", en: "I'm still open", es: "Aún estoy abierto" } }
        ],
        next: "b_importance"
      },
      b_importance: {
        type: "multi", flow: "buyer", key: "importance", min: 0,
        bot: [{
          de: "Was ist Ihnen besonders wichtig?",
          en: "What matters most to you?",
          es: "¿Qué es lo más importante para usted?"
        }],
        options: [
          { v: "meerblick", l: { de: "Meerblick", en: "Sea view", es: "Vistas al mar" } },
          { v: "strandnaehe", l: { de: "Strandnähe", en: "Close to the beach", es: "Cerca de la playa" } },
          { v: "ruhe", l: { de: "Ruhe & Privatsphäre", en: "Peace & privacy", es: "Tranquilidad y privacidad" } },
          { v: "naehe_palma", l: { de: "Nähe zu Palma", en: "Close to Palma", es: "Cerca de Palma" } },
          { v: "golfplatz", l: { de: "Golfplatz", en: "Golf course", es: "Campo de golf" } },
          { v: "yachthafen", l: { de: "Yachthafen", en: "Marina", es: "Puerto deportivo" } },
          { v: "familienfreundlich", l: { de: "Familienfreundlich", en: "Family-friendly", es: "Ideal para familias" } },
          { v: "intl_schulen", l: { de: "Internationale Schulen", en: "International schools", es: "Colegios internacionales" } },
          { v: "moderne_architektur", l: { de: "Moderne Architektur", en: "Modern architecture", es: "Arquitectura moderna" } },
          { v: "finca", l: { de: "Traditionelle Finca", en: "Traditional finca", es: "Finca tradicional" } },
          { v: "vermietbarkeit", l: { de: "Gute Vermietbarkeit", en: "Good rental potential", es: "Buen potencial de alquiler" } }
        ],
        next: "b_region"
      },
      /* Phase 2 – Region & Lifestyle (multi-select per client) */
      b_region: {
        type: "multi", flow: "buyer", key: "regions", min: 1,
        bot: [{
          de: "Welche Region passt am besten zu Ihrem Lebensstil?",
          en: "Which region best suits your lifestyle?",
          es: "¿Qué región se adapta mejor a su estilo de vida?"
        }],
        options: [
          { v: "palma", l: { de: "Palma & Umgebung inkl. Son Vida", en: "Palma & surroundings incl. Son Vida", es: "Palma y alrededores, incl. Son Vida" } },
          { v: "suedwesten", l: { de: "Südwesten (Port d'Andratx, Santa Ponsa, Puerto Portals, Bendinat)", en: "Southwest (Port d'Andratx, Santa Ponsa, Puerto Portals, Bendinat)", es: "Suroeste (Port d'Andratx, Santa Ponsa, Puerto Portals, Bendinat)" } },
          { v: "norden", l: { de: "Norden (Pollensa, Alcúdia)", en: "North (Pollensa, Alcúdia)", es: "Norte (Pollensa, Alcúdia)" } },
          { v: "westen", l: { de: "Westen (Sóller, Deià, Valldemossa)", en: "West (Sóller, Deià, Valldemossa)", es: "Oeste (Sóller, Deià, Valldemossa)" } },
          { v: "zentrum", l: { de: "Zentrum / ländlich", en: "Centre / rural", es: "Centro / rural" } },
          { v: "beratung", l: { de: "Ich wünsche Beratung", en: "I would like advice", es: "Deseo asesoramiento" } }
        ],
        next: "b_region_dyn"
      },
      b_region_dyn: {
        type: "dynamic", flow: "buyer", from: "regions",
        map: {
          palma: {
            de: "Palma verbindet mediterranen Lifestyle mit urbanem Luxus. Besonders gefragt sind aktuell Altstadt-Apartments, moderne Penthouses und Villen in Son Vida oder Genova.",
            en: "Palma blends Mediterranean lifestyle with urban luxury. Old-town apartments, modern penthouses and villas in Son Vida or Genova are particularly sought after right now.",
            es: "Palma combina el estilo de vida mediterráneo con el lujo urbano. Actualmente, los apartamentos del casco antiguo, los áticos modernos y las villas en Son Vida o Génova son especialmente demandados."
          },
          suedwesten: {
            de: "Der Südwesten gehört zu den exklusivsten Regionen Mallorcas. Besonders beliebt sind Port Andratx, Bendinat und Santa Ponsa – bekannt für luxuriöse Villen, Yachthäfen, Golfplätze und internationale Communities.",
            en: "The southwest is one of Mallorca's most exclusive regions. Port Andratx, Bendinat and Santa Ponsa are especially popular – known for luxury villas, marinas, golf courses and international communities.",
            es: "El suroeste es una de las regiones más exclusivas de Mallorca. Port Andratx, Bendinat y Santa Ponsa son especialmente populares, conocidos por sus villas de lujo, puertos deportivos, campos de golf y comunidades internacionales."
          },
          norden: {
            de: "Der Norden Mallorcas bietet eine besonders entspannte und authentische Atmosphäre. Regionen wie Pollensa und Alcúdia sind bekannt für Natur, lange Strände und großzügige Immobilien mit viel Privatsphäre.",
            en: "The north of Mallorca offers a particularly relaxed and authentic atmosphere. Areas such as Pollensa and Alcúdia are known for nature, long beaches and spacious properties with plenty of privacy.",
            es: "El norte de Mallorca ofrece un ambiente especialmente relajado y auténtico. Zonas como Pollensa y Alcúdia son conocidas por su naturaleza, sus largas playas y sus amplias propiedades con mucha privacidad."
          },
          westen: {
            de: "Der Westen Mallorcas zählt zu den spektakulärsten und exklusivsten Landschaften der Insel. Orte wie Deià und Sóller verbinden Natur, Privatsphäre und authentischen mediterranen Charme auf besondere Weise.",
            en: "The west of Mallorca is among the island's most spectacular and exclusive landscapes. Villages such as Deià and Sóller combine nature, privacy and authentic Mediterranean charm in a very special way.",
            es: "El oeste de Mallorca cuenta con algunos de los paisajes más espectaculares y exclusivos de la isla. Pueblos como Deià y Sóller combinan naturaleza, privacidad y un auténtico encanto mediterráneo de una manera muy especial."
          },
          zentrum: {
            de: "Das Inselzentrum bietet besonders viel Ruhe, Privatsphäre und authentisches Mallorca. Viele Käufer entscheiden sich hier bewusst für großzügige Fincas, weitläufige Grundstücke und einen entschleunigten Lebensstil.",
            en: "The island's interior offers exceptional peace, privacy and authentic Mallorca. Many buyers deliberately choose spacious fincas, expansive plots and a slower pace of life here.",
            es: "El interior de la isla ofrece una tranquilidad, privacidad y autenticidad excepcionales. Muchos compradores eligen aquí, de forma consciente, amplias fincas, extensas parcelas y un ritmo de vida más pausado."
          },
          beratung: {
            de: "Sehr gerne. Einer unserer Berater geht im persönlichen Gespräch gezielt auf Ihre Wünsche ein und empfiehlt Ihnen die passende Region.",
            en: "With pleasure. One of our advisors will address your wishes personally and recommend the region that suits you best.",
            es: "Con mucho gusto. Uno de nuestros asesores atenderá sus deseos de forma personal y le recomendará la región que mejor se adapte a usted."
          }
        },
        next: "b_proptype"
      },
      b_proptype: {
        type: "single", flow: "buyer", key: "propertyType",
        bot: [{
          de: "Welche Art Immobilie interessiert Sie?",
          en: "What type of property interests you?",
          es: "¿Qué tipo de propiedad le interesa?"
        }],
        options: [
          { v: "villa_finca_haus", l: { de: "Villa, Finca, Haus", en: "Villa, finca, house", es: "Villa, finca, casa" } },
          { v: "appartement_penthouse", l: { de: "Appartement / Penthouse", en: "Apartment / penthouse", es: "Apartamento / ático" } },
          { v: "grundstueck", l: { de: "Grundstück", en: "Plot of land", es: "Terreno" } },
          { v: "renovierung_invest", l: { de: "Renovierung / Invest", en: "Renovation / investment", es: "Reforma / inversión" } }
        ],
        next: "b_bedrooms"
      },
      /* Phase 3 – Objektqualifizierung */
      b_bedrooms: {
        type: "single", flow: "buyer", key: "bedrooms",
        bot: [{
          de: "Wie viele Schlafzimmer wünschen Sie ungefähr?",
          en: "Roughly how many bedrooms would you like?",
          es: "¿Aproximadamente cuántos dormitorios desea?"
        }],
        options: [
          { v: "1-2", l: { de: "1–2", en: "1–2", es: "1–2" } },
          { v: "3-4", l: { de: "3–4", en: "3–4", es: "3–4" } },
          { v: "5plus", l: { de: "5+", en: "5+", es: "5+" } },
          { v: "offen", l: { de: "Noch offen", en: "Still open", es: "Aún por decidir" } }
        ],
        next: "b_budget"
      },
      b_budget: {
        type: "single", flow: "buyer", key: "budget",
        bot: [{
          de: "In welchem Investitionsrahmen suchen Sie?",
          en: "What investment range are you looking in?",
          es: "¿En qué rango de inversión está buscando?"
        }],
        options: [
          { v: "bis_500k", l: { de: "bis 500.000 €", en: "up to €500,000", es: "hasta 500.000 €" } },
          { v: "500k_1m", l: { de: "500.000 € – 1 Mio. €", en: "€500,000 – €1m", es: "500.000 € – 1 M€" } },
          { v: "1_3m", l: { de: "1 – 3 Mio. €", en: "€1m – €3m", es: "1 – 3 M€" } },
          { v: "3_5m", l: { de: "3 – 5 Mio. €", en: "€3m – €5m", es: "3 – 5 M€" } },
          { v: "5m_plus", l: { de: "5 Mio. €+", en: "€5m+", es: "5 M€+" } },
          { v: "offen", l: { de: "Noch offen", en: "Still open", es: "Aún por decidir" } }
        ],
        next: "b_viewed"
      },
      /* Phase 4 – Qualifizierung Premium-Leads */
      b_viewed: {
        type: "single", flow: "buyer", key: "viewed",
        bot: [{
          de: "Haben Sie bereits Immobilien auf Mallorca besichtigt?",
          en: "Have you already viewed properties on Mallorca?",
          es: "¿Ya ha visitado propiedades en Mallorca?"
        }],
        options: [
          { v: "ja", l: { de: "Ja", en: "Yes", es: "Sí" } },
          { v: "nochnicht", l: { de: "Noch nicht", en: "Not yet", es: "Todavía no" } },
          { v: "anfang", l: { de: "Erst am Anfang der Suche", en: "Just starting my search", es: "Estoy empezando la búsqueda" } }
        ],
        next: "b_contactpref"
      },
      /* Phase 5 – Conversion */
      b_contactpref: {
        type: "single", flow: "buyer", key: "contactPref",
        bot: [{
          de: "Perfekt. Auf Basis Ihrer Angaben kann ich passende Immobilien für Sie vorbereiten. Wie möchten Sie am liebsten kontaktiert werden?",
          en: "Perfect. Based on your details I can prepare matching properties for you. How would you prefer to be contacted?",
          es: "Perfecto. Con sus datos puedo preparar propiedades a su medida. ¿Cómo prefiere que le contactemos?"
        }],
        options: [
          {
            v: "whatsapp", l: { de: "WhatsApp", en: "WhatsApp", es: "WhatsApp" },
            note: {
              de: "Hervorragend. Unsere Berater senden Ihnen diskret passende Immobilienvorschläge direkt per WhatsApp zu.",
              en: "Excellent. Our advisors will discreetly send you matching property suggestions directly via WhatsApp.",
              es: "Excelente. Nuestros asesores le enviarán con discreción propuestas a medida directamente por WhatsApp."
            }
          },
          { v: "telefon", l: { de: "Telefon", en: "Phone", es: "Teléfono" } },
          { v: "email", l: { de: "E-Mail", en: "Email", es: "Correo electrónico" } },
          { v: "videocall", l: { de: "Videocall", en: "Video call", es: "Videollamada" } }
        ],
        next: "b_form"
      },
      b_form: {
        type: "form", flow: "buyer", key: "contact",
        bot: [{
          de: "Bitte hinterlassen Sie Ihre Kontaktdaten – alle Felder sind Pflichtfelder.",
          en: "Please leave your contact details – all fields are required.",
          es: "Por favor, deje sus datos de contacto: todos los campos son obligatorios."
        }],
        fields: [
          { name: "firstName", type: "text", required: true, labelKey: "firstName" },
          { name: "lastName", type: "text", required: true, labelKey: "lastName" },
          { name: "email", type: "email", required: true, labelKey: "email" },
          { name: "phone", type: "tel", required: true, labelKey: "phone" }
        ],
        next: "b_consent"
      },
      b_consent: {
        type: "consent", flow: "buyer", submit: true, next: "b_end"
      },
      /* Phase 6 – Abschluss */
      b_end: {
        type: "end", flow: "buyer",
        bot: [{
          de: "Vielen Dank, {name}. Ein Immobilienberater von MALLORCA DELUXE wird sich zeitnah persönlich bei Ihnen melden und passende Objekte vorbereiten.",
          en: "Thank you, {name}. A property advisor from MALLORCA DELUXE will contact you personally very soon and prepare suitable properties for you.",
          es: "Gracias, {name}. Un asesor inmobiliario de MALLORCA DELUXE se pondrá en contacto con usted personalmente muy pronto y preparará propiedades adecuadas."
        }]
      },

      /* ===================== SELLER FLOW ===================== */
      /* Phase 1 – Einstieg & Vertrauen */
      s_intro: {
        type: "message", flow: "seller",
        bot: [{
          de: "Sehr gerne unterstütze ich Sie beim Verkauf Ihrer Immobilie auf Mallorca. Je nach Lage und Immobilientyp bestehen aktuell deutliche Preisunterschiede am Markt. Gerne prüfen wir unverbindlich das aktuelle Marktpotenzial Ihrer Immobilie.",
          en: "I would be delighted to support you in selling your property on Mallorca. Depending on location and property type there are currently significant price differences in the market. We are happy to assess your property's current market potential, with no obligation.",
          es: "Estaré encantado de ayudarle a vender su propiedad en Mallorca. Según la ubicación y el tipo de inmueble, actualmente existen diferencias de precio notables en el mercado. Con mucho gusto evaluamos, sin compromiso, el potencial de mercado actual de su propiedad."
        }],
        next: "s_proptype"
      },
      /* Phase 2 – Objekt erfassen */
      s_proptype: {
        type: "single", flow: "seller", key: "propertyType",
        bot: [{
          de: "Um welche Art von Immobilie handelt es sich?",
          en: "What type of property is it?",
          es: "¿De qué tipo de propiedad se trata?"
        }],
        options: [
          { v: "villa", l: { de: "Villa", en: "Villa", es: "Villa" } },
          { v: "finca", l: { de: "Finca", en: "Finca", es: "Finca" } },
          { v: "appartement", l: { de: "Appartement", en: "Apartment", es: "Apartamento" } },
          { v: "penthouse", l: { de: "Penthouse", en: "Penthouse", es: "Ático" } },
          { v: "grundstueck", l: { de: "Grundstück", en: "Plot of land", es: "Terreno" } }
        ],
        next: "s_region"
      },
      s_region: {
        type: "single", flow: "seller", key: "region",
        bot: [{
          de: "In welcher Region befindet sich die Immobilie?",
          en: "In which region is the property located?",
          es: "¿En qué región se encuentra la propiedad?"
        }],
        options: [
          { v: "palma", l: { de: "Palma", en: "Palma", es: "Palma" } },
          { v: "suedwesten", l: { de: "Südwesten", en: "Southwest", es: "Suroeste" } },
          { v: "sueden_suedosten", l: { de: "Süden / Südosten", en: "South / Southeast", es: "Sur / Sureste" } },
          { v: "norden", l: { de: "Norden", en: "North", es: "Norte" } },
          { v: "westen", l: { de: "Westen", en: "West", es: "Oeste" } },
          { v: "zentrum", l: { de: "Zentrum", en: "Centre", es: "Centro" } },
          { v: "sonstige", l: { de: "Sonstige", en: "Other", es: "Otra" } }
        ],
        next: "s_region_dyn"
      },
      s_region_dyn: {
        type: "dynamic", flow: "seller", from: "region",
        map: {
          palma: {
            de: "Immobilien in Palma sind aktuell besonders gefragt – vor allem bei internationalen Käufern.",
            en: "Properties in Palma are currently in especially high demand – above all among international buyers.",
            es: "Las propiedades en Palma tienen actualmente una demanda especialmente alta, sobre todo entre compradores internacionales."
          },
          suedwesten: {
            de: "Der Südwesten zählt zu den gefragtesten Premiumlagen Mallorcas. Besonders Immobilien in Port Andratx, Bendinat, Santa Ponsa und Camp de Mar erzielen aktuell eine starke internationale Nachfrage.",
            en: "The southwest is one of Mallorca's most sought-after premium locations. Properties in Port Andratx, Bendinat, Santa Ponsa and Camp de Mar in particular are currently attracting strong international demand.",
            es: "El suroeste es una de las zonas premium más solicitadas de Mallorca. En particular, las propiedades en Port Andratx, Bendinat, Santa Ponsa y Camp de Mar registran actualmente una fuerte demanda internacional."
          },
          sueden_suedosten: {
            de: "Der Süden und Südosten Mallorcas überzeugt mit Naturhäfen, Buchten und authentischen Orten – eine Lage, die bei Käufern stetig an Beliebtheit gewinnt.",
            en: "The south and southeast of Mallorca impress with natural harbours, coves and authentic towns – a location steadily growing in popularity among buyers.",
            es: "El sur y el sureste de Mallorca destacan por sus puertos naturales, calas y pueblos auténticos, una ubicación que gana popularidad de forma constante entre los compradores."
          },
          norden: {
            de: "Der Norden Mallorcas erfreut sich besonders bei Käufern großer Beliebtheit, die Ruhe, Natur und authentisches Inselgefühl suchen.",
            en: "The north of Mallorca is especially popular with buyers seeking peace, nature and an authentic island feel.",
            es: "El norte de Mallorca es especialmente apreciado por compradores que buscan tranquilidad, naturaleza y un auténtico ambiente isleño."
          },
          westen: {
            de: "Der Westen Mallorcas gehört zu den exklusivsten und zugleich rarsten Immobilienmärkten der Insel. Besonders in Sóller und Deià besteht eine hohe Nachfrage nach einzigartigen Immobilien mit Charakter, Meerblick und Privatsphäre.",
            en: "The west of Mallorca is among the most exclusive and at the same time rarest property markets on the island. In Sóller and Deià especially there is high demand for unique properties with character, sea views and privacy.",
            es: "El oeste de Mallorca es uno de los mercados inmobiliarios más exclusivos y, a la vez, más escasos de la isla. Especialmente en Sóller y Deià existe una gran demanda de propiedades únicas con carácter, vistas al mar y privacidad."
          },
          zentrum: {
            de: "Das Inselzentrum gewinnt bei internationalen Käufern zunehmend an Beliebtheit – insbesondere bei Interessenten, die Ruhe, großzügige Grundstücke und authentisches Mallorca suchen.",
            en: "The island's interior is becoming increasingly popular with international buyers – particularly those seeking peace, generous plots and authentic Mallorca.",
            es: "El interior de la isla gana cada vez más popularidad entre los compradores internacionales, en especial entre quienes buscan tranquilidad, parcelas amplias y la Mallorca auténtica."
          },
          sonstige: {
            de: "Vielen Dank. Wir bewerten Immobilien in allen Lagen Mallorcas und ordnen Ihren Standort gerne individuell ein.",
            en: "Thank you. We value properties in every location on Mallorca and will happily assess your specific area individually.",
            es: "Gracias. Valoramos propiedades en todas las zonas de Mallorca y evaluaremos su ubicación concreta de forma individual."
          }
        },
        next: "s_features"
      },
      /* Phase 3 (Verkaufsabsicht) – per client: OMITTED */
      /* Phase 4 – Marktpotenzial & Qualifizierung */
      s_features: {
        type: "multi", flow: "seller", key: "features", min: 0,
        bot: [{
          de: "Welche Eigenschaften treffen auf Ihre Immobilie zu?",
          en: "Which features apply to your property?",
          es: "¿Qué características tiene su propiedad?"
        }],
        options: [
          { v: "meerblick", l: { de: "Meerblick", en: "Sea view", es: "Vistas al mar" } },
          { v: "moderne_ausstattung", l: { de: "Moderne Ausstattung", en: "Modern fittings", es: "Equipamiento moderno" } },
          { v: "neubau", l: { de: "Neubau", en: "New build", es: "Obra nueva" } },
          { v: "aussenflaechen", l: { de: "Große Außenflächen", en: "Large outdoor areas", es: "Grandes espacios exteriores" } },
          { v: "pool", l: { de: "Pool", en: "Pool", es: "Piscina" } },
          { v: "gaestehaus", l: { de: "Gästehaus", en: "Guest house", es: "Casa de invitados" } },
          { v: "vermietlizenz", l: { de: "Lizenz zur Ferienvermietung", en: "Holiday rental licence", es: "Licencia de alquiler vacacional" } },
          { v: "golfplatz", l: { de: "Nähe Golfplatz", en: "Near golf course", es: "Cerca de campo de golf" } },
          { v: "yachthafen", l: { de: "Yachthafen-Nähe", en: "Near marina", es: "Cerca de puerto deportivo" } }
        ],
        next: "s_valued"
      },
      s_valued: {
        type: "single", flow: "seller", key: "valued",
        bot: [{
          de: "Wurde die Immobilie bereits professionell bewertet?",
          en: "Has the property already been professionally valued?",
          es: "¿La propiedad ya ha sido tasada profesionalmente?"
        }],
        options: [
          { v: "ja", l: { de: "Ja", en: "Yes", es: "Sí" } },
          { v: "nein", l: { de: "Nein", en: "No", es: "No" } },
          { v: "vorlaengererzeit", l: { de: "Vor längerer Zeit", en: "Some time ago", es: "Hace bastante tiempo" } }
        ],
        next: "s_contactpref"
      },
      /* Phase 5 – Lead Conversion */
      s_contactpref: {
        type: "single", flow: "seller", key: "contactPref",
        bot: [{
          de: "Gerne erstellen wir für Sie eine kostenlose und unverbindliche Marktpreiseinschätzung. Wie möchten Sie kontaktiert werden?",
          en: "We are happy to prepare a free, no-obligation market price assessment for you. How would you like to be contacted?",
          es: "Con mucho gusto le preparamos una estimación de precio de mercado gratuita y sin compromiso. ¿Cómo desea que le contactemos?"
        }],
        options: [
          {
            v: "whatsapp", l: { de: "WhatsApp", en: "WhatsApp", es: "WhatsApp" },
            note: {
              de: "Sehr gerne. Wir melden uns diskret per WhatsApp bei Ihnen.",
              en: "With pleasure. We will reach out to you discreetly via WhatsApp.",
              es: "Con mucho gusto. Nos pondremos en contacto con usted de forma discreta por WhatsApp."
            }
          },
          { v: "telefon", l: { de: "Telefon", en: "Phone", es: "Teléfono" } },
          { v: "email", l: { de: "E-Mail", en: "Email", es: "Correo electrónico" } },
          { v: "termin", l: { de: "Persönlicher Termin", en: "In-person appointment", es: "Cita presencial" } }
        ],
        next: "s_form"
      },
      s_form: {
        type: "form", flow: "seller", key: "contact",
        bot: [{
          de: "Bitte hinterlassen Sie Ihre Kontaktdaten – alle Felder sind Pflichtfelder.",
          en: "Please leave your contact details – all fields are required.",
          es: "Por favor, deje sus datos de contacto: todos los campos son obligatorios."
        }],
        fields: [
          { name: "firstName", type: "text", required: true, labelKey: "firstName" },
          { name: "lastName", type: "text", required: true, labelKey: "lastName" },
          { name: "phone", type: "tel", required: true, labelKey: "phone" },
          { name: "email", type: "email", required: true, labelKey: "email" }
        ],
        next: "s_consent"
      },
      s_consent: {
        type: "consent", flow: "seller", submit: true, next: "s_end"
      },
      /* Phase 6 – Abschluss */
      s_end: {
        type: "end", flow: "seller",
        bot: [{
          de: "Vielen Dank für Ihre Anfrage, {name}. Ein Immobilienexperte von MALLORCA DELUXE wird Ihre Angaben prüfen und sich zeitnah persönlich mit Ihnen in Verbindung setzen.",
          en: "Thank you for your enquiry, {name}. A property expert from MALLORCA DELUXE will review your details and contact you personally very soon.",
          es: "Gracias por su solicitud, {name}. Un experto inmobiliario de MALLORCA DELUXE revisará sus datos y se pondrá en contacto con usted personalmente muy pronto."
        }]
      },

      /* ===================== PROPERTY-PAGE FLOW (shorter) ===================== */
      property_entry: {
        type: "single", flow: "property", key: "intent",
        bot: [{
          de: "Hallo! Schön, dass Ihnen diese Immobilie gefällt. Ich beantworte Ihnen gerne Ihre Fragen – ganz unkompliziert. Wie darf ich Ihnen helfen?",
          en: "Hello! Great that you like this property. I'm happy to answer your questions – quite simply. How may I help you?",
          es: "¡Hola! Me alegra que le guste esta propiedad. Con gusto respondo a sus preguntas, de forma muy sencilla. ¿En qué puedo ayudarle?"
        }],
        options: [
          { v: "interesse", l: { de: "Ich interessiere mich für diese Immobilie", en: "I'm interested in this property", es: "Me interesa esta propiedad" } },
          { v: "besichtigung", l: { de: "Besichtigung anfragen", en: "Request a viewing", es: "Solicitar una visita" } },
          { v: "aehnliche", l: { de: "Ähnliche Objekte erhalten", en: "Receive similar properties", es: "Recibir propiedades similares" } }
        ],
        next: "p_timeframe"
      },
      p_timeframe: {
        type: "single", flow: "property", key: "timeframe",
        bot: [{
          de: "Wann möchten Sie idealerweise kaufen?",
          en: "When would you ideally like to buy?",
          es: "¿Cuándo le gustaría comprar idealmente?"
        }],
        options: [
          { v: "sofort", l: { de: "Sofort / sehr zeitnah", en: "Immediately / very soon", es: "De inmediato / muy pronto" } },
          { v: "6m", l: { de: "In den nächsten 6 Monaten", en: "Within the next 6 months", es: "En los próximos 6 meses" } },
          { v: "6_12m", l: { de: "In 6 – 12 Monaten", en: "In 6 – 12 months", es: "En 6 – 12 meses" } },
          { v: "beobachtung", l: { de: "Nur Marktbeobachtung", en: "Just watching the market", es: "Solo observando el mercado" } }
        ],
        next: "p_budget"
      },
      p_budget: {
        type: "single", flow: "property", key: "budget",
        bot: [{
          de: "In welchem Budgetrahmen bewegen Sie sich?",
          en: "What budget range are you working with?",
          es: "¿En qué rango de presupuesto se mueve?"
        }],
        options: [
          { v: "bis_500k", l: { de: "bis 500.000 €", en: "up to €500,000", es: "hasta 500.000 €" } },
          { v: "500k_1m", l: { de: "500.000 € – 1 Mio. €", en: "€500,000 – €1m", es: "500.000 € – 1 M€" } },
          { v: "1_3m", l: { de: "1 – 3 Mio. €", en: "€1m – €3m", es: "1 – 3 M€" } },
          { v: "3_5m", l: { de: "3 – 5 Mio. €", en: "€3m – €5m", es: "3 – 5 M€" } },
          { v: "5m_plus", l: { de: "5 Mio. €+", en: "€5m+", es: "5 M€+" } },
          { v: "offen", l: { de: "Noch offen", en: "Still open", es: "Aún por decidir" } }
        ],
        next: "p_contactpref"
      },
      p_contactpref: {
        type: "single", flow: "property", key: "contactPref",
        bot: [{
          de: "Wie dürfen wir Sie am besten erreichen?",
          en: "How may we best reach you?",
          es: "¿Cómo podemos contactarle mejor?"
        }],
        options: [
          {
            v: "whatsapp", l: { de: "WhatsApp", en: "WhatsApp", es: "WhatsApp" },
            note: {
              de: "Sehr gerne – so erhalten Sie schnell und unkompliziert alle Details.",
              en: "With pleasure – that way you'll get all the details quickly and easily.",
              es: "Con mucho gusto: así recibirá todos los detalles de forma rápida y sencilla."
            }
          },
          { v: "telefon", l: { de: "Telefon", en: "Phone", es: "Teléfono" } },
          { v: "email", l: { de: "E-Mail", en: "Email", es: "Correo electrónico" } },
          { v: "videocall", l: { de: "Videocall", en: "Video call", es: "Videollamada" } }
        ],
        next: "p_form"
      },
      p_form: {
        type: "form", flow: "property", key: "contact",
        bot: [{
          de: "Bitte hinterlassen Sie Ihre Kontaktdaten – alle Felder sind Pflichtfelder.",
          en: "Please leave your contact details – all fields are required.",
          es: "Por favor, deje sus datos de contacto: todos los campos son obligatorios."
        }],
        fields: [
          { name: "firstName", type: "text", required: true, labelKey: "firstName" },
          { name: "lastName", type: "text", required: true, labelKey: "lastName" },
          { name: "email", type: "email", required: true, labelKey: "email" },
          { name: "phone", type: "tel", required: true, labelKey: "phone" }
        ],
        next: "p_consent"
      },
      p_consent: {
        type: "consent", flow: "property", submit: true, next: "p_end"
      },
      p_end: {
        type: "end", flow: "property",
        bot: [{
          de: "Vielen Dank, {name}. Ein Berater von MALLORCA DELUXE meldet sich zeitnah persönlich bei Ihnen.",
          en: "Thank you, {name}. An advisor from MALLORCA DELUXE will contact you personally very soon.",
          es: "Gracias, {name}. Un asesor de MALLORCA DELUXE se pondrá en contacto con usted personalmente muy pronto."
        }]
      }
    }
  };

  w.MDC_FLOWS = FLOWS;
})(window);
