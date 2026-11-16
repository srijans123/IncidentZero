import os

OUT_DIR = "video/07_remotion/public/diagrams"
os.makedirs(OUT_DIR, exist_ok=True)

# Helper for SVG boilerplate
def wrap_svg(title, subtitle, content):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080a10"/>
      <stop offset="50%" stop-color="#0e1322"/>
      <stop offset="100%" stop-color="#06080d"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141a2e" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#0d111d" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#7000ff"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00ff9d"/>
      <stop offset="100%" stop-color="#00b4d8"/>
    </linearGradient>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffb800"/>
      <stop offset="100%" stop-color="#ff4d00"/>
    </linearGradient>
    <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f293d" stroke-width="0.75" stroke-opacity="0.4"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1920" height="1080" fill="url(#bgGrad)"/>
  <rect width="1920" height="1080" fill="url(#gridPattern)"/>

  <!-- Top Accent Bar -->
  <rect x="0" y="0" width="1920" height="4" fill="url(#cyanGrad)"/>

  <!-- Header Header -->
  <g transform="translate(100, 75)">
    <rect x="0" y="0" width="8" height="48" fill="#00f0ff" rx="4" filter="url(#glowCyan)"/>
    <text x="24" y="34" font-family="'JetBrains Mono', 'Segoe UI', monospace" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="2">{title.upper()}</text>
    <text x="24" y="62" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="500" fill="#00f0ff" letter-spacing="1">{subtitle}</text>
    
    <g transform="translate(1500, 0)">
      <rect x="0" y="0" width="220" height="38" rx="6" fill="#141a2e" stroke="#00f0ff" stroke-width="1.5" stroke-opacity="0.5"/>
      <circle cx="20" cy="19" r="6" fill="#00ff9d" filter="url(#glowGreen)"/>
      <text x="36" y="24" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#00ff9d">GROUP 76 · ARCH SPEC</text>
    </g>
  </g>

  <!-- Body Content -->
  <g transform="translate(100, 180)">
    {content}
  </g>
</svg>'''

diagrams = {}

# 1. Outage Crisis
diagrams["outage_crisis"] = wrap_svg(
    "Campus Infrastructure Failure & Ticket Storm",
    "Cascading operational paralysis across academic, residential, and examination services",
    '''
    <!-- Top Step Chain -->
    <g transform="translate(40, 20)">
      <!-- Step 1 -->
      <rect x="0" y="0" width="360" height="200" rx="12" fill="url(#cardGrad)" stroke="#ff3864" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="0" y="0" width="360" height="8" rx="4" fill="#ff3864"/>
      <text x="30" y="50" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#ff3864">STAGE 01 · ROOT TRIGGER</text>
      <text x="30" y="90" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="700" fill="#ffffff">Academic Core Fiber Sever</text>
      <text x="30" y="130" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">Physical fiber optic conduit sheared</text>
      <text x="30" y="155" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">during library wing excavation.</text>

      <!-- Arrow 1 -->
      <path d="M 380 100 L 430 100" stroke="#ff3864" stroke-width="3" stroke-dasharray="6,4"/>
      <polygon points="430,94 445,100 430,106" fill="#ff3864"/>

      <!-- Step 2 -->
      <g transform="translate(460, 0)">
        <rect x="0" y="0" width="360" height="200" rx="12" fill="url(#cardGrad)" stroke="#ffb800" stroke-width="2" filter="url(#dropShadow)"/>
        <rect x="0" y="0" width="360" height="8" rx="4" fill="#ffb800"/>
        <text x="30" y="50" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#ffb800">STAGE 02 · CASCADING COLLAPSE</text>
        <text x="30" y="90" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="700" fill="#ffffff">LMS &amp; Auth Cluster Offline</text>
        <text x="30" y="130" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">RADIUS authentication drops;</text>
        <text x="30" y="155" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">portal unresponsive during tests.</text>
      </g>

      <!-- Arrow 2 -->
      <path d="M 840 100 L 890 100" stroke="#ffb800" stroke-width="3" stroke-dasharray="6,4"/>
      <polygon points="890,94 905,100 890,106" fill="#ffb800"/>

      <!-- Step 3 -->
      <g transform="translate(920, 0)">
        <rect x="0" y="0" width="360" height="200" rx="12" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="2" filter="url(#dropShadow)"/>
        <rect x="0" y="0" width="360" height="8" rx="4" fill="#00f0ff"/>
        <text x="30" y="50" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#00f0ff">STAGE 03 · BLAST RADIUS</text>
        <text x="30" y="90" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="700" fill="#ffffff">6,000+ Campus Stakeholders</text>
        <text x="30" y="130" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">Students locked out of online quizzes;</text>
        <text x="30" y="155" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">faculty grade submissions blocked.</text>
      </g>

      <!-- Arrow 3 -->
      <path d="M 1300 100 L 1350 100" stroke="#00f0ff" stroke-width="3" stroke-dasharray="6,4"/>
      <polygon points="1350,94 1365,100 1350,106" fill="#00f0ff"/>

      <!-- Step 4 -->
      <g transform="translate(1380, 0)">
        <rect x="0" y="0" width="300" height="200" rx="12" fill="url(#cardGrad)" stroke="#ff3864" stroke-width="2" filter="url(#dropShadow)"/>
        <rect x="0" y="0" width="300" height="8" rx="4" fill="#ff3864"/>
        <text x="25" y="50" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#ff3864">STAGE 04 · STORM CHAOS</text>
        <text x="25" y="90" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="700" fill="#ffffff">1,200+ Unsorted Tickets</text>
        <text x="25" y="130" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">Helpdesk staff overwhelmed;</text>
        <text x="25" y="155" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">no root cause visibility.</text>
      </g>
    </g>

    <!-- Bottom Comparison -->
    <g transform="translate(40, 280)">
      <!-- Legacy Helpdesk -->
      <rect x="0" y="0" width="810" height="420" rx="16" fill="#140d12" stroke="#ff3864" stroke-width="1.5" stroke-opacity="0.6"/>
      <text x="40" y="55" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="800" fill="#ff3864">CONVENTIONAL CAMPUS HELPDESK (LEGACY)</text>
      
      <g transform="translate(40, 95)">
        <circle cx="10" cy="15" r="6" fill="#ff3864"/>
        <text x="30" y="20" font-family="'Segoe UI', sans-serif" font-size="18" fill="#e2e8f0"><tspan font-weight="bold">Zero Topology Awareness:</tspan> Treats every reported issue as isolated incident.</text>
        
        <circle cx="10" cy="80" r="6" fill="#ff3864"/>
        <text x="30" y="85" font-family="'Segoe UI', sans-serif" font-size="18" fill="#e2e8f0"><tspan font-weight="bold">Manual Triage Bottleneck:</tspan> Single human admin reads and routes tickets.</text>

        <circle cx="10" cy="145" r="6" fill="#ff3864"/>
        <text x="30" y="150" font-family="'Segoe UI', sans-serif" font-size="18" fill="#e2e8f0"><tspan font-weight="bold">Vulnerable Database Rows:</tspan> Technicians can edit history directly via SQL.</text>

        <circle cx="10" cy="210" r="6" fill="#ff3864"/>
        <text x="30" y="215" font-family="'Segoe UI', sans-serif" font-size="18" fill="#e2e8f0"><tspan font-weight="bold">Silent SLA Failures:</tspan> Timers continue running when waiting on vendors.</text>

        <circle cx="10" cy="275" r="6" fill="#ff3864"/>
        <text x="30" y="280" font-family="'Segoe UI', sans-serif" font-size="18" fill="#e2e8f0"><tspan font-weight="bold">High MTTR:</tspan> Average Mean Time to Resolution exceeds 6.8 hours.</text>
      </g>

      <!-- Incident-Zero Solution -->
      <g transform="translate(870, 0)">
        <rect x="0" y="0" width="810" height="420" rx="16" fill="#0b1719" stroke="#00f0ff" stroke-width="2" filter="url(#glowCyan)"/>
        <text x="40" y="55" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="800" fill="#00f0ff">INCIDENT-ZERO (I-ITSM v2.2) SOLUTION</text>
        
        <g transform="translate(40, 95)">
          <circle cx="10" cy="15" r="6" fill="#00ff9d"/>
          <text x="30" y="20" font-family="'Segoe UI', sans-serif" font-size="18" fill="#ffffff"><tspan font-weight="bold">Service Dependency DAG:</tspan> Tarjan cycle detection &amp; automatic blast radius calculation.</text>
          
          <circle cx="10" cy="80" r="6" fill="#00ff9d"/>
          <text x="30" y="85" font-family="'Segoe UI', sans-serif" font-size="18" fill="#ffffff"><tspan font-weight="bold">HNSW Storm Correlation:</tspan> Automatically clusters 500+ symptoms into 1 root problem.</text>

          <circle cx="10" cy="145" r="6" fill="#00ff9d"/>
          <text x="30" y="150" font-family="'Segoe UI', sans-serif" font-size="18" fill="#ffffff"><tspan font-weight="bold">Cryptographic Merkle Chain:</tspan> SHA-256 tamper-evident immutable audit log.</text>

          <circle cx="10" cy="210" r="6" fill="#00ff9d"/>
          <text x="30" y="215" font-family="'Segoe UI', sans-serif" font-size="18" fill="#ffffff"><tspan font-weight="bold">Dual-Clock SLA Engine:</tspan> Freezes SLA during client hold; sticky breach enforcement.</text>

          <circle cx="10" cy="275" r="6" fill="#00ff9d"/>
          <text x="30" y="280" font-family="'Segoe UI', sans-serif" font-size="18" fill="#ffffff"><tspan font-weight="bold">Ultra-Low MTTR:</tspan> Automated routing resolves critical outages in under 42 minutes.</text>
        </g>
      </g>
    </g>
    '''
)

# 2. Hexagonal Architecture
diagrams["hexagonal_architecture"] = wrap_svg(
    "Hexagonal Architecture (Ports & Adapters)",
    "Strict architectural decoupling: Pure domain core is 100% agnostic of frameworks & databases",
    '''
    <g transform="translate(60, 20)">
      <!-- Outer Hexagon / Layer: Driving Adapters (Left) -->
      <rect x="0" y="30" width="400" height="660" rx="16" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="0" y="30" width="400" height="8" rx="4" fill="#00f0ff"/>
      <text x="30" y="80" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="800" fill="#00f0ff">DRIVING ADAPTERS</text>
      <text x="30" y="110" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">Inbound HTTP, SSE &amp; UI Clients</text>

      <g transform="translate(25, 140)">
        <rect x="0" y="0" width="350" height="90" rx="10" fill="#1b243b" stroke="#2d3748" stroke-width="1.5"/>
        <text x="20" y="38" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">REST Controllers (Spring MVC)</text>
        <text x="20" y="68" font-family="'JetBrains Mono', monospace" font-size="13" fill="#00f0ff">/api/v1/incidents, /auth, /routing</text>

        <rect x="0" y="110" width="350" height="90" rx="10" fill="#1b243b" stroke="#2d3748" stroke-width="1.5"/>
        <text x="20" y="148" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">Server-Sent Events (SSE)</text>
        <text x="20" y="178" font-family="'JetBrains Mono', monospace" font-size="13" fill="#00ff9d">Realtime State Broadcast to HUD</text>

        <rect x="0" y="220" width="350" height="90" rx="10" fill="#1b243b" stroke="#2d3748" stroke-width="1.5"/>
        <text x="20" y="258" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">React 19 Frontend Client</text>
        <text x="20" y="288" font-family="'JetBrains Mono', monospace" font-size="13" fill="#ffb800">Student Portal, Workbench, Admin</text>

        <rect x="0" y="330" width="350" height="90" rx="10" fill="#1b243b" stroke="#2d3748" stroke-width="1.5"/>
        <text x="20" y="368" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">Automated CLI / Shell Tests</text>
        <text x="20" y="398" font-family="'JetBrains Mono', monospace" font-size="13" fill="#a0aec0">verify-m1.sh ... verify-m6.sh</text>
      </g>

      <!-- Middle Circle: PURE DOMAIN CORE -->
      <g transform="translate(470, 0)">
        <rect x="0" y="0" width="680" height="720" rx="24" fill="#0a101f" stroke="#00ff9d" stroke-width="3" filter="url(#glowGreen)"/>
        <rect x="0" y="0" width="680" height="10" rx="5" fill="#00ff9d"/>
        
        <text x="50" y="60" font-family="'JetBrains Mono', monospace" font-size="24" font-weight="900" fill="#00ff9d">PURE DOMAIN CORE (edu.campus.iitsm.*)</text>
        <text x="50" y="90" font-family="'Segoe UI', sans-serif" font-size="16" fill="#ffffff">COMPILER-VERIFIED: ZERO SPRING, JPA, HIBERNATE OR JACKSON IMPORTS</text>

        <!-- Ports Sub-box -->
        <g transform="translate(40, 120)">
          <rect x="0" y="0" width="600" height="150" rx="12" fill="#14213d" stroke="#00f0ff" stroke-width="1.5"/>
          <text x="25" y="35" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#00f0ff">INBOUND &amp; OUTBOUND PORTS (INTERFACES)</text>
          <text x="25" y="70" font-family="'JetBrains Mono', monospace" font-size="14" fill="#ffffff">• ClockPort (SystemClock / SimulatedClock)</text>
          <text x="25" y="95" font-family="'JetBrains Mono', monospace" font-size="14" fill="#ffffff">• IdGeneratorPort (UUID / Snowflake)</text>
          <text x="25" y="120" font-family="'JetBrains Mono', monospace" font-size="14" fill="#ffffff">• IncidentRepositoryPort, SlaTimerPort, AuditLedgerPort</text>
        </g>

        <!-- Domain Aggregates & Logic -->
        <g transform="translate(40, 300)">
          <rect x="0" y="0" width="600" height="370" rx="12" fill="#11192e" stroke="#2d3748" stroke-width="1.5"/>
          <text x="25" y="40" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00ff9d">DOMAIN AGGREGATES &amp; SERVICES</text>
          
          <g transform="translate(25, 65)">
            <rect x="0" y="0" width="260" height="85" rx="8" fill="#1b243b" stroke="#00ff9d" stroke-width="1"/>
            <text x="15" y="32" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">Incident Aggregate</text>
            <text x="15" y="58" font-family="'JetBrains Mono', monospace" font-size="12" fill="#a0aec0">11-State Finite State Machine</text>

            <rect x="290" y="0" width="260" height="85" rx="8" fill="#1b243b" stroke="#00ff9d" stroke-width="1"/>
            <text x="15" y="32" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">Dual-Clock SLA Engine</text>
            <text x="15" y="58" font-family="'JetBrains Mono', monospace" font-size="12" fill="#a0aec0">Pause interval calendar logic</text>

            <rect x="0" y="105" width="260" height="85" rx="8" fill="#1b243b" stroke="#00ff9d" stroke-width="1"/>
            <text x="15" y="32" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">Service Dependency DAG</text>
            <text x="15" y="58" font-family="'JetBrains Mono', monospace" font-size="12" fill="#a0aec0">Tarjan SCC cycle validator</text>

            <rect x="290" y="105" width="260" height="85" rx="8" fill="#1b243b" stroke="#00ff9d" stroke-width="1"/>
            <text x="15" y="32" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">7 Routing Strategies</text>
            <text x="15" y="58" font-family="'JetBrains Mono', monospace" font-size="12" fill="#a0aec0">Pluggable strategy pattern</text>

            <rect x="0" y="210" width="550" height="70" rx="8" fill="#1b243b" stroke="#ff3864" stroke-width="1"/>
            <text x="20" y="32" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">Cryptographic Audit Ledger</text>
            <text x="20" y="54" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffb800">Immutable SHA-256 Merkle chain linking every state delta</text>
          </g>
        </g>
      </g>

      <!-- Outer Layer: Driven Adapters (Right) -->
      <g transform="translate(1220, 30)">
        <rect x="0" y="0" width="400" height="660" rx="16" fill="url(#cardGrad)" stroke="#7000ff" stroke-width="2" filter="url(#dropShadow)"/>
        <rect x="0" y="0" width="400" height="8" rx="4" fill="#7000ff"/>
        <text x="30" y="50" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="800" fill="#a855f7">DRIVEN ADAPTERS</text>
        <text x="30" y="80" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">Outbound Infrastructure &amp; Storage</text>

        <g transform="translate(25, 110)">
          <rect x="0" y="0" width="350" height="90" rx="10" fill="#1b243b" stroke="#2d3748" stroke-width="1.5"/>
          <text x="20" y="38" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">PostgreSQL 16 &amp; Flyway</text>
          <text x="20" y="68" font-family="'JetBrains Mono', monospace" font-size="13" fill="#a855f7">Neon Serverless Cloud DB / JDBC</text>

          <rect x="0" y="110" width="350" height="90" rx="10" fill="#1b243b" stroke="#2d3748" stroke-width="1.5"/>
          <text x="20" y="148" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">HNSW Vector Search Engine</text>
          <text x="20" y="178" font-family="'JetBrains Mono', monospace" font-size="13" fill="#00f0ff">Semantic incident storm correlation</text>

          <rect x="0" y="220" width="350" height="90" rx="10" fill="#1b243b" stroke="#2d3748" stroke-width="1.5"/>
          <text x="20" y="258" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">Audit Event Transactional Listeners</text>
          <text x="20" y="288" font-family="'JetBrains Mono', monospace" font-size="13" fill="#ff3864">Propagation.MANDATORY In-Tx</text>

          <rect x="0" y="330" width="350" height="90" rx="10" fill="#1b243b" stroke="#2d3748" stroke-width="1.5"/>
          <text x="20" y="368" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">Notification &amp; Pager Adapters</text>
          <text x="20" y="398" font-family="'JetBrains Mono', monospace" font-size="13" fill="#00ff9d">Campus Email &amp; Webhook alerts</text>
        </g>
      </g>
    </g>
    '''
)

# 3. System Interaction Flow
diagrams["system_interaction_flow"] = wrap_svg(
    "End-to-End System Interaction Flow",
    "Synchronous command mutation with asynchronous transactional event propagation",
    '''
    <g transform="translate(40, 40)">
      <!-- Lane 1: Client -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="320" height="600" rx="12" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="1.5"/>
        <text x="30" y="45" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00f0ff">CLIENT ACTORS</text>
        <circle cx="50" cy="120" r="24" fill="#1e293b" stroke="#00f0ff" stroke-width="2"/>
        <text x="90" y="125" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">Student / Employee</text>
        
        <circle cx="50" cy="240" r="24" fill="#1e293b" stroke="#00ff9d" stroke-width="2"/>
        <text x="90" y="245" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">Technician (Workbench)</text>

        <circle cx="50" cy="360" r="24" fill="#1e293b" stroke="#ffb800" stroke-width="2"/>
        <text x="90" y="365" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">Admin (Control Center)</text>

        <circle cx="50" cy="480" r="24" fill="#1e293b" stroke="#ff3864" stroke-width="2"/>
        <text x="90" y="485" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">Campus Stage Arcade</text>
      </g>

      <!-- Lane 2: API Gateway -->
      <g transform="translate(360, 0)">
        <rect x="0" y="0" width="300" height="600" rx="12" fill="url(#cardGrad)" stroke="#2d3748" stroke-width="1.5"/>
        <text x="30" y="45" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#ffffff">API LAYER</text>
        
        <g transform="translate(20, 80)">
          <rect x="0" y="0" width="260" height="100" rx="8" fill="#141c2e" stroke="#00f0ff" stroke-width="1"/>
          <text x="15" y="35" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#00f0ff">JWT Auth Filter</text>
          <text x="15" y="65" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">HMAC-SHA256 Token Validation</text>
        </g>

        <g transform="translate(20, 220)">
          <rect x="0" y="0" width="260" height="120" rx="8" fill="#141c2e" stroke="#00f0ff" stroke-width="1"/>
          <text x="15" y="35" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#00f0ff">Spring Web MVC</text>
          <text x="15" y="65" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">IncidentCommandController</text>
          <text x="15" y="90" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">SlaAuditQueryController</text>
        </g>
      </g>

      <!-- Lane 3: Application Services -->
      <g transform="translate(700, 0)">
        <rect x="0" y="0" width="340" height="600" rx="12" fill="url(#cardGrad)" stroke="#2d3748" stroke-width="1.5"/>
        <text x="30" y="45" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#ffffff">APPLICATION USE CASES</text>
        
        <g transform="translate(20, 80)">
          <rect x="0" y="0" width="300" height="470" rx="8" fill="#141c2e" stroke="#00ff9d" stroke-width="1.5"/>
          <text x="20" y="35" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">ReportIncidentUseCase</text>
          <text x="20" y="95" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">AcknowledgeIncidentUseCase</text>
          <text x="20" y="155" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">TriageIncidentUseCase</text>
          <text x="20" y="215" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">ResolveIncidentUseCase</text>
          <text x="20" y="275" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">VerifyAndCloseUseCase</text>
          <text x="20" y="335" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">RunTarjanValidationUseCase</text>
          <text x="20" y="395" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">ClusterStormIncidentsUseCase</text>
        </g>
      </g>

      <!-- Lane 4: Pure Domain Core -->
      <g transform="translate(1080, 0)">
        <rect x="0" y="0" width="340" height="600" rx="12" fill="url(#cardGrad)" stroke="#00ff9d" stroke-width="2" filter="url(#glowGreen)"/>
        <text x="30" y="45" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00ff9d">PURE DOMAIN CORE</text>
        
        <g transform="translate(20, 80)">
          <rect x="0" y="0" width="300" height="130" rx="8" fill="#091a18" stroke="#00ff9d" stroke-width="1"/>
          <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="700" fill="#00ff9d">11-State Finite State Machine</text>
          <text x="15" y="60" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Enforces valid state transitions</text>
          <text x="15" y="85" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Emits StateTransitionedDomainEvent</text>
        </g>

        <g transform="translate(20, 240)">
          <rect x="0" y="0" width="300" height="130" rx="8" fill="#091a18" stroke="#00ff9d" stroke-width="1"/>
          <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="700" fill="#00ff9d">SLA Chronometer Engine</text>
          <text x="15" y="60" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Calculates business deadlines</text>
          <text x="15" y="85" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Emits SlaWarning / SlaBreached</text>
        </g>

        <g transform="translate(20, 400)">
          <rect x="0" y="0" width="300" height="150" rx="8" fill="#091a18" stroke="#00ff9d" stroke-width="1"/>
          <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="700" fill="#00ff9d">Cryptographic Ledger Service</text>
          <text x="15" y="60" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Calculates SHA-256 block hash</text>
          <text x="15" y="85" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Links hash to previous block</text>
        </g>
      </g>

      <!-- Lane 5: Infrastructure & DB -->
      <g transform="translate(1460, 0)">
        <rect x="0" y="0" width="280" height="600" rx="12" fill="url(#cardGrad)" stroke="#7000ff" stroke-width="1.5"/>
        <text x="30" y="45" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#a855f7">PERSISTENCE</text>
        
        <g transform="translate(20, 80)">
          <rect x="0" y="0" width="240" height="180" rx="8" fill="#17122b" stroke="#7000ff" stroke-width="1"/>
          <text x="15" y="35" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="700" fill="#a855f7">PostgreSQL 16</text>
          <text x="15" y="70" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">• incidents table</text>
          <text x="15" y="95" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">• audit_ledger table</text>
          <text x="15" y="120" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">• service_topology table</text>
          <text x="15" y="145" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">• routing_configs table</text>
        </g>

        <g transform="translate(20, 290)">
          <rect x="0" y="0" width="240" height="150" rx="8" fill="#17122b" stroke="#7000ff" stroke-width="1"/>
          <text x="15" y="35" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="700" fill="#a855f7">SSE Broadcaster</text>
          <text x="15" y="70" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Non-blocking Sinks</text>
          <text x="15" y="95" font-family="'Segoe UI', sans-serif" font-size="13" fill="#00ff9d">Emits to all active browsers</text>
        </g>
      </g>
    </g>
    '''
)

# 4. Exception Hierarchy
diagrams["exception_hierarchy"] = wrap_svg(
    "Pure Domain Exception Hierarchy",
    "Clean unchecked domain exception taxonomy: No framework dependencies, self-documenting error semantics",
    '''
    <g transform="translate(100, 40)">
      <!-- Root Exception -->
      <g transform="translate(480, 20)">
        <rect x="0" y="0" width="560" height="110" rx="16" fill="url(#cardGrad)" stroke="#ff3864" stroke-width="2" filter="url(#dropShadow)"/>
        <text x="35" y="45" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="900" fill="#ff3864">DomainException (Root Unchecked)</text>
        <text x="35" y="80" font-family="'Segoe UI', sans-serif" font-size="16" fill="#ffffff">extends RuntimeException · Zero Spring or Web imports</text>
      </g>

      <!-- Connecting Trunk Lines -->
      <path d="M 760 130 L 760 210" stroke="#ff3864" stroke-width="3"/>
      <path d="M 120 210 L 1400 210" stroke="#ff3864" stroke-width="3"/>
      
      <!-- Branch 1 -->
      <path d="M 120 210 L 120 280" stroke="#ff3864" stroke-width="3"/>
      <g transform="translate(0, 280)">
        <rect x="0" y="0" width="270" height="240" rx="12" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="1.5"/>
        <text x="20" y="40" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#00f0ff">InvalidStateTransition</text>
        <text x="20" y="65" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#00f0ff">Exception</text>
        <text x="20" y="110" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Thrown when an illegal FSM transition is attempted (e.g. CLOSED to REPORTED).</text>
        <rect x="15" y="165" width="240" height="45" rx="6" fill="#162238"/>
        <text x="25" y="193" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00f0ff">HTTP 409 Conflict</text>
      </g>

      <!-- Branch 2 -->
      <path d="M 440 210 L 440 280" stroke="#ff3864" stroke-width="3"/>
      <g transform="translate(320, 280)">
        <rect x="0" y="0" width="270" height="240" rx="12" fill="url(#cardGrad)" stroke="#ffb800" stroke-width="1.5"/>
        <text x="20" y="40" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#ffb800">SlaBreachedException</text>
        <text x="20" y="85" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Triggered by Chronometer when resolution deadline expires under non-paused clock.</text>
        <rect x="15" y="165" width="240" height="45" rx="6" fill="#2d2215"/>
        <text x="25" y="193" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffb800">Sticky Breach Recorded</text>
      </g>

      <!-- Branch 3 -->
      <path d="M 760 210 L 760 280" stroke="#ff3864" stroke-width="3"/>
      <g transform="translate(640, 280)">
        <rect x="0" y="0" width="270" height="240" rx="12" fill="url(#cardGrad)" stroke="#ff3864" stroke-width="1.5"/>
        <text x="20" y="40" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#ff3864">CycleDetectedException</text>
        <text x="20" y="85" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Raised by Tarjan SCC engine if edge addition creates circular service dependency.</text>
        <rect x="15" y="165" width="240" height="45" rx="6" fill="#2d1519"/>
        <text x="25" y="193" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ff3864">DAG Invariant Guard</text>
      </g>

      <!-- Branch 4 -->
      <path d="M 1080 210 L 1080 280" stroke="#ff3864" stroke-width="3"/>
      <g transform="translate(960, 280)">
        <rect x="0" y="0" width="270" height="240" rx="12" fill="url(#cardGrad)" stroke="#a855f7" stroke-width="1.5"/>
        <text x="20" y="40" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#a855f7">AccessDeniedDomain</text>
        <text x="20" y="65" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#a855f7">Exception</text>
        <text x="20" y="110" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Enforces role-based permissions at pure domain aggregate boundary.</text>
        <rect x="15" y="165" width="240" height="45" rx="6" fill="#20152d"/>
        <text x="25" y="193" font-family="'JetBrains Mono', monospace" font-size="12" fill="#a855f7">HTTP 403 Forbidden</text>
      </g>

      <!-- Branch 5 -->
      <path d="M 1400 210 L 1400 280" stroke="#ff3864" stroke-width="3"/>
      <g transform="translate(1280, 280)">
        <rect x="0" y="0" width="270" height="240" rx="12" fill="url(#cardGrad)" stroke="#00ff9d" stroke-width="1.5"/>
        <text x="20" y="40" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#00ff9d">EntityNotFoundException</text>
        <text x="20" y="85" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Signals missing incident ID or unregistered technician aggregate.</text>
        <rect x="15" y="165" width="240" height="45" rx="6" fill="#142820"/>
        <text x="25" y="193" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">HTTP 404 Not Found</text>
      </g>
    </g>
    '''
)

# 5. Modulith Boundaries
diagrams["modulith_boundaries"] = wrap_svg(
    "Spring Modulith Boundaries & ArchUnit R1–R9",
    "Zero circular dependencies across 5 modular sub-domains, strictly verified via ArchUnit architecture tests",
    '''
    <g transform="translate(100, 40)">
      <!-- Module Cards in circle/grid -->
      <g transform="translate(560, 40)">
        <rect x="0" y="0" width="400" height="140" rx="14" fill="#0d1b2a" stroke="#00f0ff" stroke-width="2.5" filter="url(#dropShadow)"/>
        <text x="25" y="40" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" fill="#00f0ff">edu.campus.iitsm.incident</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Lifecycle, Aggregate Root &amp; FSM Transitions</text>
        <rect x="25" y="90" width="160" height="28" rx="4" fill="#1b2e4b"/>
        <text x="35" y="109" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00f0ff">CORE AGGREGATE</text>
      </g>

      <g transform="translate(40, 240)">
        <rect x="0" y="0" width="380" height="140" rx="14" fill="#0d1b2a" stroke="#00ff9d" stroke-width="2" filter="url(#dropShadow)"/>
        <text x="25" y="40" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" fill="#00ff9d">edu.campus.iitsm.sla</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Dual-Clock Chronometer &amp; Escalation</text>
        <rect x="25" y="90" width="180" height="28" rx="4" fill="#153625"/>
        <text x="35" y="109" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">TIMER LISTENER IN-TX</text>
      </g>

      <g transform="translate(1100, 240)">
        <rect x="0" y="0" width="380" height="140" rx="14" fill="#0d1b2a" stroke="#ff3864" stroke-width="2" filter="url(#dropShadow)"/>
        <text x="25" y="40" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" fill="#ff3864">edu.campus.iitsm.audit</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Cryptographic SHA-256 Ledger Chain</text>
        <rect x="25" y="90" width="180" height="28" rx="4" fill="#36151c"/>
        <text x="35" y="109" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ff3864">AUDIT LISTENER IN-TX</text>
      </g>

      <g transform="translate(180, 480)">
        <rect x="0" y="0" width="380" height="140" rx="14" fill="#0d1b2a" stroke="#ffb800" stroke-width="2" filter="url(#dropShadow)"/>
        <text x="25" y="40" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" fill="#ffb800">edu.campus.iitsm.routing</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">7 Pluggable Dispatch Strategies</text>
        <rect x="25" y="90" width="180" height="28" rx="4" fill="#362d15"/>
        <text x="35" y="109" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffb800">STRATEGY PATTERN</text>
      </g>

      <g transform="translate(960, 480)">
        <rect x="0" y="0" width="380" height="140" rx="14" fill="#0d1b2a" stroke="#a855f7" stroke-width="2" filter="url(#dropShadow)"/>
        <text x="25" y="40" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" fill="#a855f7">edu.campus.iitsm.topology</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Service DAG &amp; Tarjan Cycle Validator</text>
        <rect x="25" y="90" width="180" height="28" rx="4" fill="#2d1536"/>
        <text x="35" y="109" font-family="'JetBrains Mono', monospace" font-size="12" fill="#a855f7">GRAPH ALGORITHM</text>
      </g>

      <!-- Center Invariants Callout -->
      <g transform="translate(600, 270)">
        <rect x="0" y="0" width="320" height="140" rx="12" fill="#141a2e" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4,4"/>
        <text x="25" y="35" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#ffffff">ARCHUNIT RULES (R1–R9)</text>
        <text x="25" y="65" font-family="'Segoe UI', sans-serif" font-size="13" fill="#00ff9d">✓ Zero cyclic package deps</text>
        <text x="25" y="90" font-family="'Segoe UI', sans-serif" font-size="13" fill="#00ff9d">✓ Zero framework in domain</text>
        <text x="25" y="115" font-family="'Segoe UI', sans-serif" font-size="13" fill="#00ff9d">✓ In-Tx Mandatory Listeners</text>
      </g>
    </g>
    '''
)

# 6. Priority Matrix Calc
diagrams["priority_matrix_calc"] = wrap_svg(
    "3×3 Deterministic Priority Calculation Matrix",
    "ITIL-compliant matrix mapping Impact and Urgency to deterministic incident priority bands",
    '''
    <g transform="translate(180, 40)">
      <!-- Table Headers -->
      <g transform="translate(250, 0)">
        <text x="140" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00f0ff">HIGH URGENCY</text>
        <text x="460" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00f0ff">MEDIUM URGENCY</text>
        <text x="790" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00f0ff">LOW URGENCY</text>
      </g>

      <!-- Row 1: High Impact -->
      <g transform="translate(0, 70)">
        <rect x="0" y="0" width="220" height="160" rx="10" fill="#141a2e" stroke="#ff3864" stroke-width="1.5"/>
        <text x="25" y="70" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#ff3864">HIGH IMPACT</text>
        <text x="25" y="105" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Whole campus offline</text>

        <!-- Cell (High, High) -> P1 -->
        <g transform="translate(250, 0)">
          <rect x="0" y="0" width="300" height="160" rx="10" fill="#2d1217" stroke="#ff3864" stroke-width="2.5" filter="url(#dropShadow)"/>
          <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="900" fill="#ff3864">P1 · CRITICAL</text>
          <text x="25" y="85" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">Ack: 15 mins · Resolution: 1 hr</text>
          <text x="25" y="115" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffb800">Auto-Escalation: SMS / Push</text>
        </g>

        <!-- Cell (High, Med) -> P2 -->
        <g transform="translate(580, 0)">
          <rect x="0" y="0" width="300" height="160" rx="10" fill="#2b1f12" stroke="#ffb800" stroke-width="2"/>
          <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="900" fill="#ffb800">P2 · HIGH</text>
          <text x="25" y="85" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">Ack: 30 mins · Resolution: 4 hrs</text>
          <text x="25" y="115" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Senior Tech Assigned</text>
        </g>

        <!-- Cell (High, Low) -> P3 -->
        <g transform="translate(910, 0)">
          <rect x="0" y="0" width="300" height="160" rx="10" fill="#12252a" stroke="#00f0ff" stroke-width="1.5"/>
          <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="900" fill="#00f0ff">P3 · MEDIUM</text>
          <text x="25" y="85" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">Ack: 1 hr · Resolution: 8 hrs</text>
          <text x="25" y="115" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Standard Queue</text>
        </g>
      </g>

      <!-- Row 2: Medium Impact -->
      <g transform="translate(0, 250)">
        <rect x="0" y="0" width="220" height="160" rx="10" fill="#141a2e" stroke="#ffb800" stroke-width="1.5"/>
        <text x="25" y="70" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#ffb800">MED IMPACT</text>
        <text x="25" y="105" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Single department / lab</text>

        <!-- Cell (Med, High) -> P2 -->
        <g transform="translate(250, 0)">
          <rect x="0" y="0" width="300" height="160" rx="10" fill="#2b1f12" stroke="#ffb800" stroke-width="2"/>
          <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="900" fill="#ffb800">P2 · HIGH</text>
          <text x="25" y="85" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">Ack: 30 mins · Resolution: 4 hrs</text>
        </g>

        <!-- Cell (Med, Med) -> P3 -->
        <g transform="translate(580, 0)">
          <rect x="0" y="0" width="300" height="160" rx="10" fill="#12252a" stroke="#00f0ff" stroke-width="1.5"/>
          <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="900" fill="#00f0ff">P3 · MEDIUM</text>
          <text x="25" y="85" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">Ack: 1 hr · Resolution: 8 hrs</text>
        </g>

        <!-- Cell (Med, Low) -> P4 -->
        <g transform="translate(910, 0)">
          <rect x="0" y="0" width="300" height="160" rx="10" fill="#10261f" stroke="#00ff9d" stroke-width="1.5"/>
          <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="900" fill="#00ff9d">P4 · LOW</text>
          <text x="25" y="85" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">Ack: 2 hrs · Resolution: 24 hrs</text>
        </g>
      </g>

      <!-- Row 3: Low Impact -->
      <g transform="translate(0, 430)">
        <rect x="0" y="0" width="220" height="160" rx="10" fill="#141a2e" stroke="#00ff9d" stroke-width="1.5"/>
        <text x="25" y="70" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00ff9d">LOW IMPACT</text>
        <text x="25" y="105" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Individual workstation</text>

        <!-- Cell (Low, High) -> P3 -->
        <g transform="translate(250, 0)">
          <rect x="0" y="0" width="300" height="160" rx="10" fill="#12252a" stroke="#00f0ff" stroke-width="1.5"/>
          <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="900" fill="#00f0ff">P3 · MEDIUM</text>
          <text x="25" y="85" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">Ack: 1 hr · Resolution: 8 hrs</text>
        </g>

        <!-- Cell (Low, Med) -> P4 -->
        <g transform="translate(580, 0)">
          <rect x="0" y="0" width="300" height="160" rx="10" fill="#10261f" stroke="#00ff9d" stroke-width="1.5"/>
          <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="900" fill="#00ff9d">P4 · LOW</text>
          <text x="25" y="85" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">Ack: 2 hrs · Resolution: 24 hrs</text>
        </g>

        <!-- Cell (Low, Low) -> P4 -->
        <g transform="translate(910, 0)">
          <rect x="0" y="0" width="300" height="160" rx="10" fill="#10261f" stroke="#00ff9d" stroke-width="1.5"/>
          <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="900" fill="#00ff9d">P4 · LOW</text>
          <text x="25" y="85" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">Ack: 2 hrs · Resolution: 24 hrs</text>
        </g>
      </g>
    </g>
    '''
)

# 7. Dual Clock Architecture
diagrams["dual_clock_architecture"] = wrap_svg(
    "Dual-Clock SLA Chronometer Engine",
    "Wall-Clock regulatory compliance vs Paused Business-Calendar SLA computation",
    '''
    <g transform="translate(60, 40)">
      <!-- Clock 1: Wall Clock -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="760" height="600" rx="16" fill="url(#cardGrad)" stroke="#ffb800" stroke-width="2" filter="url(#dropShadow)"/>
        <text x="40" y="55" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="900" fill="#ffb800">CLOCK 1: WALL-CLOCK CHRONO</text>
        <text x="40" y="90" font-family="'Segoe UI', sans-serif" font-size="16" fill="#ffffff">Strict Physical Regulatory Elapsed Time</text>

        <g transform="translate(40, 130)">
          <rect x="0" y="0" width="680" height="90" rx="8" fill="#1e212b"/>
          <text x="25" y="38" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#ffffff">Input: ClockPort.now() (Pure Instant)</text>
          <text x="25" y="68" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Never pauses. Ticks continuously 24/7/365 without exception.</text>
          
          <rect x="0" y="110" width="680" height="90" rx="8" fill="#1e212b"/>
          <text x="25" y="38" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#ffffff">Regulatory Audit Compliance</text>
          <text x="25" y="68" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Provides exact immutable timestamps for the SHA-256 audit ledger.</text>

          <rect x="0" y="220" width="680" height="150" rx="8" fill="#2b1f14" stroke="#ffb800" stroke-width="1"/>
          <text x="25" y="38" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#ffb800">Max Physical Threshold Violation</text>
          <text x="25" y="68" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">If total wall time exceeds 72 hours, triggers executive campus escalation</text>
          <text x="25" y="95" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">even if incident spent majority of time in client pause state.</text>
        </g>
      </g>

      <!-- Clock 2: SLA Business Clock -->
      <g transform="translate(820, 0)">
        <rect x="0" y="0" width="760" height="600" rx="16" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="2" filter="url(#glowCyan)"/>
        <text x="40" y="55" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="900" fill="#00f0ff">CLOCK 2: PAUSED SLA BUSINESS CLOCK</text>
        <text x="40" y="90" font-family="'Segoe UI', sans-serif" font-size="16" fill="#ffffff">Active Operational SLA Chronometer</text>

        <g transform="translate(40, 130)">
          <rect x="0" y="0" width="680" height="90" rx="8" fill="#14213d"/>
          <text x="25" y="38" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#00f0ff">Working Hours Filtering (08:00 – 18:00 IST)</text>
          <text x="25" y="68" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Nights, campus holidays, and academic recesses are subtracted.</text>
          
          <rect x="0" y="110" width="680" height="90" rx="8" fill="#14213d"/>
          <text x="25" y="38" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#00ff9d">WAITING_FOR_CLIENT Freeze Logic</text>
          <text x="25" y="68" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Timer freezes completely. Zero SLA degradation while waiting for user info.</text>

          <rect x="0" y="220" width="680" height="150" rx="8" fill="#102b36" stroke="#00f0ff" stroke-width="1"/>
          <text x="25" y="38" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#00f0ff">Sticky Breach State Enforcement</text>
          <text x="25" y="68" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Once active business duration exceeds SLA threshold, SLA_BREACHED is set.</text>
          <text x="25" y="95" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ff3864">STICKY: Cannot be un-breached or wiped by subsequent transitions.</text>
        </g>
      </g>
    </g>
    '''
)

# 8. Clock Modes Comparison
diagrams["clock_modes_comparison"] = wrap_svg(
    "SLA Timer Behavior Across Incident States",
    "Chronometer timeline: Active running vs Paused freeze vs Stopped finality",
    '''
    <g transform="translate(80, 50)">
      <!-- Timeline Header Axis -->
      <line x1="40" y1="120" x2="1520" y2="120" stroke="#2d3748" stroke-width="4"/>
      
      <!-- State 1: REPORTED -->
      <g transform="translate(40, 60)">
        <circle cx="50" cy="60" r="26" fill="#00f0ff" filter="url(#glowCyan)"/>
        <text x="50" y="67" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" fill="#000000" text-anchor="middle">01</text>
        <text x="50" y="120" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#00f0ff" text-anchor="middle">REPORTED</text>
        <rect x="-20" y="150" width="140" height="40" rx="6" fill="#152836"/>
        <text x="50" y="175" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="700" fill="#00ff9d" text-anchor="middle">CLOCK TICKS ▶</text>
      </g>

      <!-- State 2: ASSIGNED -->
      <g transform="translate(340, 60)">
        <circle cx="50" cy="60" r="26" fill="#00f0ff"/>
        <text x="50" y="67" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" fill="#000000" text-anchor="middle">02</text>
        <text x="50" y="120" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#00f0ff" text-anchor="middle">ASSIGNED</text>
        <rect x="-20" y="150" width="140" height="40" rx="6" fill="#152836"/>
        <text x="50" y="175" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="700" fill="#00ff9d" text-anchor="middle">CLOCK TICKS ▶</text>
      </g>

      <!-- State 3: IN_PROGRESS -->
      <g transform="translate(640, 60)">
        <circle cx="50" cy="60" r="26" fill="#00f0ff"/>
        <text x="50" y="67" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" fill="#000000" text-anchor="middle">03</text>
        <text x="50" y="120" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#00f0ff" text-anchor="middle">IN_PROGRESS</text>
        <rect x="-20" y="150" width="140" height="40" rx="6" fill="#152836"/>
        <text x="50" y="175" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="700" fill="#00ff9d" text-anchor="middle">CLOCK TICKS ▶</text>
      </g>

      <!-- State 4: WAITING_FOR_CLIENT (FREEZE) -->
      <g transform="translate(940, 60)">
        <circle cx="50" cy="60" r="32" fill="#ffb800" filter="url(#dropShadow)"/>
        <text x="50" y="67" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="900" fill="#000000" text-anchor="middle">⏸</text>
        <text x="50" y="120" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#ffb800" text-anchor="middle">WAITING_CLIENT</text>
        <rect x="-30" y="150" width="160" height="40" rx="6" fill="#362814"/>
        <text x="50" y="175" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="700" fill="#ffb800" text-anchor="middle">FREEZE (0 PENALTY)</text>
      </g>

      <!-- State 5: RESOLVED -->
      <g transform="translate(1240, 60)">
        <circle cx="50" cy="60" r="26" fill="#00ff9d" filter="url(#glowGreen)"/>
        <text x="50" y="67" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" fill="#000000" text-anchor="middle">✓</text>
        <text x="50" y="120" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#00ff9d" text-anchor="middle">RESOLVED</text>
        <rect x="-20" y="150" width="140" height="40" rx="6" fill="#123620"/>
        <text x="50" y="175" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="700" fill="#00ff9d" text-anchor="middle">CLOCK STOPS ⏹</text>
      </g>

      <!-- Explanatory Panel Below -->
      <g transform="translate(40, 310)">
        <rect x="0" y="0" width="1480" height="260" rx="14" fill="url(#cardGrad)" stroke="#2d3748" stroke-width="1.5"/>
        <text x="40" y="50" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="800" fill="#ffffff">MATHEMATICAL INTERVAL CALCULATION</text>
        
        <g transform="translate(40, 80)">
          <text x="0" y="30" font-family="'JetBrains Mono', monospace" font-size="18" fill="#00f0ff">Effective SLA Elapsed Time = Total Wall Time − ∑(Pause Intervals) − ∑(Non-Business Hours)</text>
          
          <g transform="translate(0, 65)">
            <rect x="0" y="0" width="680" height="75" rx="8" fill="#141c2e"/>
            <text x="20" y="30" font-family="'Segoe UI', sans-serif" font-size="15" font-weight="700" fill="#ffffff">Pause Interval Accumulation:</text>
            <text x="20" y="55" font-family="'JetBrains Mono', monospace" font-size="13" fill="#a0aec0">Duration = [pauseTimestamp, resumeTimestamp] recorded in sla_pause_intervals</text>

            <rect x="710" y="0" width="680" height="75" rx="8" fill="#141c2e"/>
            <text x="20" y="30" font-family="'Segoe UI', sans-serif" font-size="15" font-weight="700" fill="#ffffff">Deterministic Resolution Verification:</text>
            <text x="20" y="55" font-family="'JetBrains Mono', monospace" font-size="13" fill="#a0aec0">Target Met: Effective SLA &lt; SLA Threshold? True: MET, False: BREACHED</text>
          </g>
        </g>
      </g>
    </g>
    '''
)

# 9. Service DAG Topology
diagrams["service_dag_topology"] = wrap_svg(
    "Campus Service Dependency DAG & Tarjan SCC Engine",
    "Directed acyclic topology of 12 campus nodes with O(V+E) cycle rejection and cascading blast radius",
    '''
    <g transform="translate(60, 40)">
      <!-- Root Node: Core Network -->
      <g transform="translate(680, 20)">
        <rect x="0" y="0" width="280" height="80" rx="10" fill="#2d1217" stroke="#ff3864" stroke-width="2.5" filter="url(#dropShadow)"/>
        <text x="25" y="35" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="900" fill="#ff3864">CORE NETWORK</text>
        <text x="25" y="60" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Root Switch &amp; Gateway</text>
      </g>

      <!-- Connectors from Root -->
      <path d="M 720 100 L 340 180" stroke="#00f0ff" stroke-width="2.5" marker-end="url(#arrow)"/>
      <path d="M 820 100 L 820 180" stroke="#00f0ff" stroke-width="2.5"/>
      <path d="M 920 100 L 1300 180" stroke="#00f0ff" stroke-width="2.5"/>

      <!-- Layer 1 Nodes -->
      <g transform="translate(200, 180)">
        <rect x="0" y="0" width="260" height="75" rx="10" fill="#141c2e" stroke="#00f0ff" stroke-width="2"/>
        <text x="20" y="32" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="800" fill="#00f0ff">CAMPUS WI-FI</text>
        <text x="20" y="55" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Aruba Access Points</text>
      </g>

      <g transform="translate(690, 180)">
        <rect x="0" y="0" width="260" height="75" rx="10" fill="#141c2e" stroke="#00f0ff" stroke-width="2"/>
        <text x="20" y="32" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="800" fill="#00f0ff">LMS PORTAL</text>
        <text x="20" y="55" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Moodle &amp; Online Exams</text>
      </g>

      <g transform="translate(1180, 180)">
        <rect x="0" y="0" width="260" height="75" rx="10" fill="#141c2e" stroke="#00f0ff" stroke-width="2"/>
        <text x="20" y="32" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="800" fill="#00f0ff">DATA CENTER</text>
        <text x="20" y="55" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Hyper-V Virtual Hosts</text>
      </g>

      <!-- Connectors to Layer 2 -->
      <path d="M 330 255 L 180 340" stroke="#00f0ff" stroke-width="2"/>
      <path d="M 330 255 L 480 340" stroke="#00f0ff" stroke-width="2"/>
      <path d="M 820 255 L 750 340" stroke="#00f0ff" stroke-width="2"/>
      <path d="M 820 255 L 980 340" stroke="#00f0ff" stroke-width="2"/>
      <path d="M 1310 255 L 1310 340" stroke="#00f0ff" stroke-width="2"/>

      <!-- Layer 2 Nodes -->
      <g transform="translate(60, 340)">
        <rect x="0" y="0" width="220" height="70" rx="8" fill="#141c2e" stroke="#2d3748" stroke-width="1.5"/>
        <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#ffffff">HOSTEL NET</text>
        <text x="15" y="52" font-family="'Segoe UI', sans-serif" font-size="12" fill="#a0aec0">Bhavan Subnets</text>
      </g>

      <g transform="translate(360, 340)">
        <rect x="0" y="0" width="220" height="70" rx="8" fill="#141c2e" stroke="#2d3748" stroke-width="1.5"/>
        <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#ffffff">LIBRARY SYSTEM</text>
        <text x="15" y="52" font-family="'Segoe UI', sans-serif" font-size="12" fill="#a0aec0">RFID &amp; KOHA DB</text>
      </g>

      <g transform="translate(640, 340)">
        <rect x="0" y="0" width="220" height="70" rx="8" fill="#141c2e" stroke="#2d3748" stroke-width="1.5"/>
        <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#ffffff">EXAM SYSTEM</text>
        <text x="15" y="52" font-family="'Segoe UI', sans-serif" font-size="12" fill="#a0aec0">Secure Browser Engine</text>
      </g>

      <g transform="translate(900, 340)">
        <rect x="0" y="0" width="220" height="70" rx="8" fill="#141c2e" stroke="#2d3748" stroke-width="1.5"/>
        <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#ffffff">ERP PORTAL</text>
        <text x="15" y="52" font-family="'Segoe UI', sans-serif" font-size="12" fill="#a0aec0">SWD / Timetable</text>
      </g>

      <g transform="translate(1200, 340)">
        <rect x="0" y="0" width="220" height="70" rx="8" fill="#141c2e" stroke="#2d3748" stroke-width="1.5"/>
        <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#ffffff">LAB VM CLUSTER</text>
        <text x="15" y="52" font-family="'Segoe UI', sans-serif" font-size="12" fill="#a0aec0">GPU / HPC Nodes</text>
      </g>

      <!-- Tarjan Algorithm Explanatory Box -->
      <g transform="translate(60, 470)">
        <rect x="0" y="0" width="1520" height="150" rx="12" fill="#0d1b2a" stroke="#00ff9d" stroke-width="2"/>
        <text x="30" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00ff9d">TARJAN STRONGLY CONNECTED COMPONENTS (SCC) GUARANTEE</text>
        
        <g transform="translate(30, 60)">
          <text x="0" y="20" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• <tspan font-weight="bold">Linear Time Complexity:</tspan> Runs in exact O(|V| + |E|) time using single-pass depth-first search indexing.</text>
          <text x="0" y="45" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• <tspan font-weight="bold">Cycle Prevention:</tspan> An edge addition (u → v) is immediately aborted if Tarjan identifies SCC with &gt; 1 node.</text>
          <text x="0" y="70" font-family="'Segoe UI', sans-serif" font-size="15" fill="#00f0ff">• <tspan font-weight="bold">Cascading Blast Radius:</tspan> Breadth-first traversal down the DAG reveals all affected downstream services instantly.</text>
        </g>
      </g>
    </g>
    '''
)

# 10. HNSW Vector Search
diagrams["hnsw_vector_search"] = wrap_svg(
    "Semantic Storm Clustering (HNSW Vector Search)",
    "Hierarchical Navigable Small World graph for millisecond semantic duplicate clustering",
    '''
    <g transform="translate(100, 40)">
      <!-- Left: Incoming Stream of Reports -->
      <g transform="translate(0, 40)">
        <rect x="0" y="0" width="380" height="560" rx="14" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="1.5"/>
        <text x="25" y="40" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00f0ff">REPORTED INCIDENTS</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Unstructured natural language</text>

        <g transform="translate(20, 100)">
          <rect x="0" y="0" width="340" height="90" rx="8" fill="#162238" stroke="#00f0ff" stroke-width="1"/>
          <text x="15" y="30" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="#ffffff">"Wi-Fi down in Malaviya Bhavan"</text>
          <text x="15" y="55" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">Embedding: [0.842, -0.312, 0.541...]</text>

          <rect x="0" y="110" width="340" height="90" rx="8" fill="#162238" stroke="#00f0ff" stroke-width="1"/>
          <text x="15" y="30" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="#ffffff">"No internet hostel 4 wing B"</text>
          <text x="15" y="55" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">Embedding: [0.839, -0.308, 0.539...]</text>

          <rect x="0" y="220" width="340" height="90" rx="8" fill="#162238" stroke="#00f0ff" stroke-width="1"/>
          <text x="15" y="30" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="#ffffff">"DNS failure can't reach LMS"</text>
          <text x="15" y="55" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">Embedding: [0.812, -0.295, 0.518...]</text>

          <rect x="0" y="330" width="340" height="90" rx="8" fill="#162238" stroke="#00f0ff" stroke-width="1"/>
          <text x="15" y="30" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="#ffffff">"500+ similar reports arriving..."</text>
        </g>
      </g>

      <!-- Middle: HNSW Multi-Layer Graph -->
      <g transform="translate(440, 40)">
        <rect x="0" y="0" width="680" height="560" rx="14" fill="#09111e" stroke="#00ff9d" stroke-width="2" filter="url(#glowGreen)"/>
        <text x="35" y="45" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" fill="#00ff9d">HNSW MULTI-LAYER GRAPH TRAVERSAL</text>
        
        <!-- Layer 2 (Top Sparse Layer) -->
        <g transform="translate(35, 80)">
          <rect x="0" y="0" width="610" height="100" rx="10" fill="#14213d"/>
          <text x="20" y="30" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#ffb800">LAYER 2 (COARSE NAVIGATION): Long-distance skips</text>
          <circle cx="100" cy="65" r="14" fill="#ffb800"/>
          <line x1="114" y1="65" x2="486" y2="65" stroke="#ffb800" stroke-width="2" stroke-dasharray="4,4"/>
          <circle cx="500" cy="65" r="14" fill="#ffb800"/>
        </g>

        <!-- Layer 1 (Intermediate Layer) -->
        <g transform="translate(35, 200)">
          <rect x="0" y="0" width="610" height="120" rx="10" fill="#14213d"/>
          <text x="20" y="30" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#00f0ff">LAYER 1 (MEDIUM GRAIN): Regional cluster refinement</text>
          <circle cx="80" cy="75" r="12" fill="#00f0ff"/>
          <circle cx="220" cy="75" r="12" fill="#00f0ff"/>
          <circle cx="380" cy="75" r="12" fill="#00f0ff"/>
          <circle cx="520" cy="75" r="12" fill="#00f0ff"/>
          <line x1="92" y1="75" x2="208" y2="75" stroke="#00f0ff" stroke-width="2"/>
          <line x1="232" y1="75" x2="368" y2="75" stroke="#00f0ff" stroke-width="2"/>
          <line x1="392" y1="75" x2="508" y2="75" stroke="#00f0ff" stroke-width="2"/>
        </g>

        <!-- Layer 0 (Bottom Dense Graph) -->
        <g transform="translate(35, 340)">
          <rect x="0" y="0" width="610" height="170" rx="10" fill="#14213d"/>
          <text x="20" y="30" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#00ff9d">LAYER 0 (DENSE LOCAL GRAPH): Cosine Similarity &gt; 0.88</text>
          <text x="20" y="65" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Nearest neighbor search completes in &lt; 3.2 milliseconds.</text>
          <text x="20" y="95" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Matches incoming ticket vector against existing active problem clusters.</text>
          <rect x="20" y="115" width="560" height="35" rx="6" fill="#0f3328"/>
          <text x="35" y="138" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#00ff9d">CORRELATION CONFIDENCE: 94.6% MATCH</text>
        </g>
      </g>

      <!-- Right: Clustered Problem Master -->
      <g transform="translate(1180, 40)">
        <rect x="0" y="0" width="400" height="560" rx="14" fill="url(#cardGrad)" stroke="#ff3864" stroke-width="2" filter="url(#dropShadow)"/>
        <text x="25" y="40" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#ff3864">STORM CORRELATION ROOT</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Single consolidated Master Ticket</text>

        <g transform="translate(20, 100)">
          <rect x="0" y="0" width="360" height="220" rx="10" fill="#2d1217" stroke="#ff3864" stroke-width="1.5"/>
          <text x="20" y="35" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="#ff3864">MASTER INCIDENT #PRB-882</text>
          <text x="20" y="70" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#ffffff">Malaviya Bhavan Core Switch Loop</text>
          
          <text x="20" y="115" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Correlated Children: 524 tickets</text>
          <text x="20" y="140" font-family="'Segoe UI', sans-serif" font-size="14" fill="#00ff9d">Technician Assigned: Vikram Anand</text>
          <text x="20" y="165" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffb800">Priority: P1 Critical (Broadcast Storm)</text>
          
          <rect x="0" y="240" width="360" height="170" rx="10" fill="#141c2e"/>
          <text x="20" y="35" font-family="'Segoe UI', sans-serif" font-size="15" font-weight="700" fill="#ffffff">Auto-Notification Broadcast</text>
          <text x="20" y="65" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">When master ticket #PRB-882 is resolved,</text>
          <text x="20" y="90" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">all 524 child tickets auto-transition to</text>
          <text x="20" y="115" font-family="'JetBrains Mono', monospace" font-size="14" fill="#00ff9d">RESOLVED simultaneously via SSE.</text>
        </g>
      </g>
    </g>
    '''
)

# 11. Seven Routing Strategies
diagrams["seven_routing_strategies"] = wrap_svg(
    "Seven Pluggable Technician Routing Strategies",
    "Open-Closed Principle: Pluggable RoutingStrategy interface with runtime strategy selection",
    '''
    <g transform="translate(60, 40)">
      <!-- Strategy Grid (3 top, 4 bottom) -->
      <!-- Strategy 1 -->
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="480" height="150" rx="12" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="1.5"/>
        <text x="25" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00f0ff">01 · ROUND-ROBIN DISPATCH</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Cycles deterministically across available active technicians</text>
        <text x="25" y="95" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Guarantees equal raw distribution across shift personnel.</text>
        <text x="25" y="125" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">Time Complexity: O(1)</text>
      </g>

      <!-- Strategy 2 -->
      <g transform="translate(540, 20)">
        <rect x="0" y="0" width="480" height="150" rx="12" fill="url(#cardGrad)" stroke="#00ff9d" stroke-width="1.5"/>
        <text x="25" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00ff9d">02 · LEAST-LOADED BALANCING</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Queries active in-flight incidents per technician</text>
        <text x="25" y="95" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Routes new incident to technician with lowest active workload.</text>
        <text x="25" y="125" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">Prevents technician burnout</text>
      </g>

      <!-- Strategy 3 -->
      <g transform="translate(1080, 20)">
        <rect x="0" y="0" width="480" height="150" rx="12" fill="url(#cardGrad)" stroke="#ffb800" stroke-width="1.5"/>
        <text x="25" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#ffb800">03 · CAMPUS-AFFINITY ZONING</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Matches physical incident location to technician zone</text>
        <text x="25" y="95" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Hostel zone, Academic block, Library, Sports complex.</text>
        <text x="25" y="125" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffb800">Minimizes campus walking transit time</text>
      </g>

      <!-- Strategy 4 -->
      <g transform="translate(0, 210)">
        <rect x="0" y="0" width="380" height="150" rx="12" fill="url(#cardGrad)" stroke="#a855f7" stroke-width="1.5"/>
        <text x="25" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#a855f7">04 · SKILL-BASED</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Category skill matrix matching:</text>
        <text x="25" y="95" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Network, Electrical, Software, Hardware.</text>
        <text x="25" y="125" font-family="'JetBrains Mono', monospace" font-size="12" fill="#a855f7">High first-touch resolution</text>
      </g>

      <!-- Strategy 5 -->
      <g transform="translate(420, 210)">
        <rect x="0" y="0" width="380" height="150" rx="12" fill="url(#cardGrad)" stroke="#ff3864" stroke-width="1.5"/>
        <text x="25" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#ff3864">05 · PRIORITY-WEIGHTED</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">P1/P2 assigned to Senior Techs</text>
        <text x="25" y="95" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Preempts junior queues during major outages.</text>
        <text x="25" y="125" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ff3864">Strict SLA compliance</text>
      </g>

      <!-- Strategy 6 -->
      <g transform="translate(840, 210)">
        <rect x="0" y="0" width="380" height="150" rx="12" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="1.5"/>
        <text x="25" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00f0ff">06 · SHIFT-AWARE</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Active shift roster checking</text>
        <text x="25" y="95" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Morning, evening, and night emergency duty.</text>
        <text x="25" y="125" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00f0ff">Zero off-duty ticket leakage</text>
      </g>

      <!-- Strategy 7 -->
      <g transform="translate(1260, 210)">
        <rect x="0" y="0" width="300" height="150" rx="12" fill="url(#cardGrad)" stroke="#00ff9d" stroke-width="1.5"/>
        <text x="25" y="35" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00ff9d">07 · AI SEMANTIC</text>
        <text x="25" y="70" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">HNSW Vector match</text>
        <text x="25" y="95" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Historical resolution affinity.</text>
        <text x="25" y="125" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">Adaptive learning</text>
      </g>

      <!-- Code Interface snippet below -->
      <g transform="translate(0, 400)">
        <rect x="0" y="0" width="1560" height="200" rx="12" fill="#0c121e" stroke="#2d3748" stroke-width="1.5"/>
        <text x="35" y="40" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#00f0ff">POLYMUTABLE STRATEGY INTERFACE DEFINITION</text>
        <text x="35" y="80" font-family="'JetBrains Mono', monospace" font-size="15" fill="#ffffff">public interface RoutingStrategy {</text>
        <text x="35" y="110" font-family="'JetBrains Mono', monospace" font-size="15" fill="#ffffff">    Optional&lt;TechnicianId&gt; selectTechnician(Incident incident, List&lt;Technician&gt; candidates, RoutingContext ctx);</text>
        <text x="35" y="140" font-family="'JetBrains Mono', monospace" font-size="15" fill="#ffffff">    RoutingStrategyType getType();</text>
        <text x="35" y="170" font-family="'JetBrains Mono', monospace" font-size="15" fill="#ffffff">}</text>
      </g>
    </g>
    '''
)

# 12. Merkle Audit Chain
diagrams["merkle_audit_chain"] = wrap_svg(
    "Cryptographic SHA-256 Tamper-Evident Audit Ledger",
    "Append-only Merkle-linked chain: Every state transition binds to preceding block hash",
    '''
    <g transform="translate(60, 50)">
      <!-- Block 0: Genesis -->
      <g transform="translate(0, 40)">
        <rect x="0" y="0" width="340" height="420" rx="14" fill="url(#cardGrad)" stroke="#a0aec0" stroke-width="1.5"/>
        <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="900" fill="#a0aec0">BLOCK #0 (GENESIS)</text>
        
        <g transform="translate(20, 75)">
          <text x="0" y="20" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">PREV_HASH:</text>
          <text x="0" y="45" font-family="'JetBrains Mono', monospace" font-size="12" fill="#a0aec0">00000000000000000000...</text>

          <text x="0" y="90" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">EVENT PAYLOAD:</text>
          <rect x="0" y="105" width="300" height="90" rx="6" fill="#141a2e"/>
          <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffffff">Action: SYSTEM_INIT</text>
          <text x="15" y="55" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffffff">Timestamp: 2026-11-09T08:00</text>
          <text x="15" y="80" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">Actor: system@bits.campus</text>

          <text x="0" y="235" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">CURRENT SHA-256 HASH:</text>
          <text x="0" y="260" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#00f0ff">a17f8b9c4d2e5a610f...</text>
        </g>
      </g>

      <!-- Link Arrow 1 -->
      <path d="M 360 250 L 410 250" stroke="#00f0ff" stroke-width="3" stroke-dasharray="6,4"/>
      <polygon points="410,244 425,250 410,256" fill="#00f0ff"/>

      <!-- Block 1: Incident Created -->
      <g transform="translate(440, 40)">
        <rect x="0" y="0" width="340" height="420" rx="14" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="2"/>
        <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="900" fill="#00f0ff">BLOCK #1 (REPORTED)</text>
        
        <g transform="translate(20, 75)">
          <text x="0" y="20" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">PREV_HASH:</text>
          <text x="0" y="45" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00f0ff">a17f8b9c4d2e5a610f...</text>

          <text x="0" y="90" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">EVENT PAYLOAD:</text>
          <rect x="0" y="105" width="300" height="90" rx="6" fill="#141a2e"/>
          <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffffff">Action: INCIDENT_CREATED</text>
          <text x="15" y="55" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffffff">Incident: INC-2026-0045</text>
          <text x="15" y="80" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">Actor: emp@bits.campus</text>

          <text x="0" y="235" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">CURRENT SHA-256 HASH:</text>
          <text x="0" y="260" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#00ff9d">7d3e91aa4bc820f1...</text>
        </g>
      </g>

      <!-- Link Arrow 2 -->
      <path d="M 800 250 L 850 250" stroke="#00ff9d" stroke-width="3" stroke-dasharray="6,4"/>
      <polygon points="850,244 865,250 850,256" fill="#00ff9d"/>

      <!-- Block 2: Incident Assigned -->
      <g transform="translate(880, 40)">
        <rect x="0" y="0" width="340" height="420" rx="14" fill="url(#cardGrad)" stroke="#00ff9d" stroke-width="2"/>
        <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="900" fill="#00ff9d">BLOCK #2 (ASSIGNED)</text>
        
        <g transform="translate(20, 75)">
          <text x="0" y="20" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">PREV_HASH:</text>
          <text x="0" y="45" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">7d3e91aa4bc820f1...</text>

          <text x="0" y="90" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">EVENT PAYLOAD:</text>
          <rect x="0" y="105" width="300" height="90" rx="6" fill="#141a2e"/>
          <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffffff">Action: TECHNICIAN_ASSIGNED</text>
          <text x="15" y="55" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffffff">Assignee: Vikram Anand</text>
          <text x="15" y="80" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">Strategy: LEAST_LOADED</text>

          <text x="0" y="235" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">CURRENT SHA-256 HASH:</text>
          <text x="0" y="260" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#ffb800">f94c12089bca5543...</text>
        </g>
      </g>

      <!-- Link Arrow 3 -->
      <path d="M 1240 250 L 1290 250" stroke="#ffb800" stroke-width="3" stroke-dasharray="6,4"/>
      <polygon points="1290,244 1305,250 1290,256" fill="#ffb800"/>

      <!-- Block 3: Resolved -->
      <g transform="translate(1320, 40)">
        <rect x="0" y="0" width="340" height="420" rx="14" fill="url(#cardGrad)" stroke="#ffb800" stroke-width="2"/>
        <text x="25" y="45" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="900" fill="#ffb800">BLOCK #3 (RESOLVED)</text>
        
        <g transform="translate(20, 75)">
          <text x="0" y="20" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">PREV_HASH:</text>
          <text x="0" y="45" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffb800">f94c12089bca5543...</text>

          <text x="0" y="90" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">EVENT PAYLOAD:</text>
          <rect x="0" y="105" width="300" height="90" rx="6" fill="#141a2e"/>
          <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffffff">Action: INCIDENT_RESOLVED</text>
          <text x="15" y="55" font-family="'JetBrains Mono', monospace" font-size="12" fill="#ffffff">Code: FIBER_SPLICED</text>
          <text x="15" y="80" font-family="'JetBrains Mono', monospace" font-size="12" fill="#00ff9d">SLA Status: MET (38m)</text>

          <text x="0" y="235" font-family="'JetBrains Mono', monospace" font-size="12" fill="#718096">CURRENT SHA-256 HASH:</text>
          <text x="0" y="260" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#00f0ff">88e401b38cf47a22...</text>
        </g>
      </g>

      <!-- Tamper Detection Banner Below -->
      <g transform="translate(0, 500)">
        <rect x="0" y="0" width="1660" height="110" rx="12" fill="#2d1217" stroke="#ff3864" stroke-width="2"/>
        <text x="30" y="40" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="900" fill="#ff3864">MATHEMATICAL TAMPER DETECTION GUARANTEE</text>
        <text x="30" y="75" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">If an adversary alters any byte of historical SQL data (e.g. modifying timestamp or resolution code), the recomputed SHA-256</text>
        <text x="30" y="98" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">diverges from downstream prev_hash pointers. The ledger verification engine instantly detects and flags the exact corrupted block.</text>
      </g>
    </g>
    '''
)

# 13. SOLID Principles
diagrams["solid_principles"] = wrap_svg(
    "SOLID Object-Oriented Design Principles in I-ITSM",
    "How the 5 foundational software engineering principles are strictly instantiated across the codebase",
    '''
    <g transform="translate(60, 30)">
      <!-- S -->
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="310" height="580" rx="14" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="2"/>
        <text x="30" y="55" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="900" fill="#00f0ff">S</text>
        <text x="80" y="50" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">Single Responsibility</text>
        
        <g transform="translate(25, 90)">
          <text x="0" y="25" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Every class has one, and only one, reason to change.</text>
          
          <rect x="0" y="60" width="260" height="130" rx="8" fill="#141c2e"/>
          <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#00f0ff">Incident Aggregate</text>
          <text x="15" y="55" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Only state transitions.</text>
          <text x="15" y="80" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#00f0ff">SlaTimerService</text>
          <text x="15" y="105" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Only clock deadlines.</text>

          <rect x="0" y="210" width="260" height="130" rx="8" fill="#141c2e"/>
          <text x="15" y="30" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#00f0ff">AuditLedgerService</text>
          <text x="15" y="55" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Only cryptographic hashes.</text>
          <text x="15" y="80" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#00f0ff">RoutingEngine</text>
          <text x="15" y="105" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Only technician selection.</text>
        </g>
      </g>

      <!-- O -->
      <g transform="translate(330, 20)">
        <rect x="0" y="0" width="310" height="580" rx="14" fill="url(#cardGrad)" stroke="#00ff9d" stroke-width="2"/>
        <text x="30" y="55" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="900" fill="#00ff9d">O</text>
        <text x="80" y="50" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">Open-Closed</text>
        
        <g transform="translate(25, 90)">
          <text x="0" y="25" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Open for extension, closed for modification.</text>
          
          <rect x="0" y="60" width="260" height="380" rx="8" fill="#141c2e"/>
          <text x="15" y="35" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#00ff9d">RoutingStrategy</text>
          <text x="15" y="65" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">New routing algorithms can be added by implementing RoutingStrategy interface</text>
          <text x="15" y="145" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">without modifying existing dispatch orchestrator or core domain logic.</text>
          <text x="15" y="240" font-family="'JetBrains Mono', monospace" font-size="13" fill="#00ff9d">• RoundRobin</text>
          <text x="15" y="270" font-family="'JetBrains Mono', monospace" font-size="13" fill="#00ff9d">• LeastLoaded</text>
          <text x="15" y="300" font-family="'JetBrains Mono', monospace" font-size="13" fill="#00ff9d">• CampusAffinity</text>
        </g>
      </g>

      <!-- L -->
      <g transform="translate(660, 20)">
        <rect x="0" y="0" width="310" height="580" rx="14" fill="url(#cardGrad)" stroke="#ffb800" stroke-width="2"/>
        <text x="30" y="55" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="900" fill="#ffb800">L</text>
        <text x="80" y="50" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">Liskov Substitution</text>
        
        <g transform="translate(25, 90)">
          <text x="0" y="25" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Subtypes must be substitutable for base types.</text>
          
          <rect x="0" y="60" width="260" height="380" rx="8" fill="#141c2e"/>
          <text x="15" y="35" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#ffb800">ClockPort</text>
          <text x="15" y="65" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">SystemClock (production wall time) and SimulatedClock (deterministic test warping)</text>
          <text x="15" y="145" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">adhere strictly to behavioral contracts without breaking domain assumptions.</text>
        </g>
      </g>

      <!-- I -->
      <g transform="translate(990, 20)">
        <rect x="0" y="0" width="310" height="580" rx="14" fill="url(#cardGrad)" stroke="#a855f7" stroke-width="2"/>
        <text x="30" y="55" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="900" fill="#a855f7">I</text>
        <text x="80" y="50" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">Interface Segregation</text>
        
        <g transform="translate(25, 90)">
          <text x="0" y="25" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Clients should not depend on unused methods.</text>
          
          <rect x="0" y="60" width="260" height="380" rx="8" fill="#141c2e"/>
          <text x="15" y="35" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#a855f7">Segregated Ports</text>
          <text x="15" y="65" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Split into fine-grained interfaces:</text>
          <text x="15" y="110" font-family="'JetBrains Mono', monospace" font-size="13" fill="#ffffff">• IncidentReadPort</text>
          <text x="15" y="140" font-family="'JetBrains Mono', monospace" font-size="13" fill="#ffffff">• IncidentCommandPort</text>
          <text x="15" y="170" font-family="'JetBrains Mono', monospace" font-size="13" fill="#ffffff">• SlaNotifierPort</text>
          <text x="15" y="200" font-family="'JetBrains Mono', monospace" font-size="13" fill="#ffffff">• AuditStorePort</text>
        </g>
      </g>

      <!-- D -->
      <g transform="translate(1320, 20)">
        <rect x="0" y="0" width="310" height="580" rx="14" fill="url(#cardGrad)" stroke="#ff3864" stroke-width="2"/>
        <text x="30" y="55" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="900" fill="#ff3864">D</text>
        <text x="80" y="50" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="700" fill="#ffffff">Dependency Inversion</text>
        
        <g transform="translate(25, 90)">
          <text x="0" y="25" font-family="'Segoe UI', sans-serif" font-size="14" fill="#a0aec0">Depend on abstractions, not concrete details.</text>
          
          <rect x="0" y="60" width="260" height="380" rx="8" fill="#141c2e"/>
          <text x="15" y="35" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" fill="#ff3864">Domain Inversion</text>
          <text x="15" y="65" font-family="'Segoe UI', sans-serif" font-size="13" fill="#ffffff">Core domain defines outbound port interfaces.</text>
          <text x="15" y="125" font-family="'Segoe UI', sans-serif" font-size="13" fill="#a0aec0">Postgres adapters implement these ports in infrastructure layer.</text>
          <text x="15" y="200" font-family="'JetBrains Mono', monospace" font-size="13" fill="#ff3864">Domain → Port ← Adapter</text>
        </g>
      </g>
    </g>
    '''
)

# 14. Test Matrix Breakdown
diagrams["test_matrix_breakdown"] = wrap_svg(
    "Testing Rigor & Automated Verification Pyramid",
    "520,036 FSM transitions, 9 ArchUnit rules, 100% domain unit tests, and Playwright E2E suites",
    '''
    <g transform="translate(120, 40)">
      <!-- Pyramid Layers -->
      <!-- Tier 1: E2E Playwright (Top) -->
      <g transform="translate(480, 20)">
        <polygon points="260,0 360,110 160,110" fill="#2d1217" stroke="#ff3864" stroke-width="2"/>
        <text x="260" y="85" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="900" fill="#ff3864" text-anchor="middle">PLAYWRIGHT E2E</text>
      </g>
      <g transform="translate(880, 45)">
        <text x="0" y="25" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#ff3864">BROWSER END-TO-END SUITE</text>
        <text x="0" y="55" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Full user journeys across Portal, Workbench, Stage, and Admin consoles.</text>
      </g>

      <!-- Tier 2: Integration & Database -->
      <g transform="translate(380, 140)">
        <polygon points="160,0 360,0 440,110 80,110" fill="#2b1f14" stroke="#ffb800" stroke-width="2"/>
        <text x="260" y="65" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="900" fill="#ffb800" text-anchor="middle">INTEGRATION &amp; FLYWAY</text>
      </g>
      <g transform="translate(880, 165)">
        <text x="0" y="25" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#ffb800">FLYWAY &amp; REST INTEGRATION</text>
        <text x="0" y="55" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Verified schema migrations, Neon PostgreSQL JDBC connections, and transactional rollbacks.</text>
      </g>

      <!-- Tier 3: ArchUnit Invariants -->
      <g transform="translate(280, 260)">
        <polygon points="100,0 420,0 500,110 20,110" fill="#12252a" stroke="#00f0ff" stroke-width="2"/>
        <text x="260" y="65" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="900" fill="#00f0ff" text-anchor="middle">ARCHUNIT INVARIANTS (R1–R9)</text>
      </g>
      <g transform="translate(880, 285)">
        <text x="0" y="25" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#00f0ff">STRUCTURAL COMPILER CHECKS</text>
        <text x="0" y="55" font-family="'Segoe UI', sans-serif" font-size="14" fill="#ffffff">Zero framework leaks in domain, mandatory in-transaction listeners, port compliance.</text>
      </g>

      <!-- Tier 4: FSM Exhaustive & Unit (Base) -->
      <g transform="translate(180, 380)">
        <polygon points="20,0 580,0 660,130 -60,130" fill="#0d281e" stroke="#00ff9d" stroke-width="2.5" filter="url(#glowGreen)"/>
        <text x="300" y="70" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="900" fill="#00ff9d" text-anchor="middle">520,036 FSM TRANSITIONS &amp; UNIT TESTS</text>
      </g>
      <g transform="translate(880, 420)">
        <text x="0" y="25" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" fill="#00ff9d">EXHAUSTIVE STATE REASONING</text>
        <text x="0" y="55" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">All 11 × 11 × (action space) evaluated; every illegal transition validated to throw.</text>
      </g>

      <!-- Summary metrics counter banner -->
      <g transform="translate(0, 540)">
        <rect x="0" y="0" width="1540" height="80" rx="10" fill="#141c2e" stroke="#2d3748" stroke-width="1.5"/>
        <text x="40" y="48" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" fill="#ffffff">TOTAL TESTS: 520,140+ · PASS RATE: 100% · EXECUTION TIME: 4.8 SECONDS · CODE COVERAGE: 96.4%</text>
      </g>
    </g>
    '''
)

# 15. Tech Report Summary
diagrams["tech_report_summary"] = wrap_svg(
    "Comprehensive Technical Specifications & Architecture Report",
    "Key engineering milestones, benchmarks, and production-grade deliverables of Incident-Zero (v2.2)",
    '''
    <g transform="translate(60, 30)">
      <!-- Row 1: 3 Big Metric Cards -->
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="510" height="200" rx="14" fill="url(#cardGrad)" stroke="#00f0ff" stroke-width="2"/>
        <text x="35" y="50" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#00f0ff">CORE AGGREGATE ENGINE</text>
        <text x="35" y="105" font-family="'JetBrains Mono', monospace" font-size="44" font-weight="900" fill="#ffffff">11 FSM STATES</text>
        <text x="35" y="145" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">520,036 mathematically verified transitions</text>
        <text x="35" y="170" font-family="'Segoe UI', sans-serif" font-size="15" fill="#00ff9d">Zero framework dependencies in domain</text>
      </g>

      <g transform="translate(550, 20)">
        <rect x="0" y="0" width="510" height="200" rx="14" fill="url(#cardGrad)" stroke="#00ff9d" stroke-width="2"/>
        <text x="35" y="50" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#00ff9d">SLA &amp; CHRONOMETER ENGINE</text>
        <text x="35" y="105" font-family="'JetBrains Mono', monospace" font-size="44" font-weight="900" fill="#ffffff">&lt; 10s RESET</text>
        <text x="35" y="145" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">Dual-clock paused calendar arithmetic</text>
        <text x="35" y="170" font-family="'Segoe UI', sans-serif" font-size="15" fill="#00f0ff">Sticky breach enforcement across resets</text>
      </g>

      <g transform="translate(1100, 20)">
        <rect x="0" y="0" width="500" height="200" rx="14" fill="url(#cardGrad)" stroke="#ffb800" stroke-width="2"/>
        <text x="35" y="50" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#ffb800">AUDIT &amp; TOPOLOGY</text>
        <text x="35" y="105" font-family="'JetBrains Mono', monospace" font-size="44" font-weight="900" fill="#ffffff">SHA-256 CHAIN</text>
        <text x="35" y="145" font-family="'Segoe UI', sans-serif" font-size="15" fill="#a0aec0">Tarjan O(V+E) cycle rejection</text>
        <text x="35" y="170" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ff3864">Tamper-evident Merkle cryptographic ledger</text>
      </g>

      <!-- Row 2: Tech Stack Grid -->
      <g transform="translate(0, 250)">
        <rect x="0" y="0" width="1600" height="380" rx="14" fill="#0d1424" stroke="#2d3748" stroke-width="1.5"/>
        <text x="40" y="45" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="800" fill="#ffffff">ENTERPRISE SYSTEM ARCHITECTURE STACK</text>

        <g transform="translate(40, 75)">
          <!-- Col 1 -->
          <g transform="translate(0, 0)">
            <text x="0" y="30" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#00f0ff">BACKEND &amp; RUNTIME</text>
            <text x="0" y="65" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Java 21 / 22 Corretto LTS</text>
            <text x="0" y="95" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Spring Boot 3.4 &amp; Modulith</text>
            <text x="0" y="125" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Spring Web MVC &amp; SSE</text>
            <text x="0" y="155" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Flyway Database Migrations</text>
            <text x="0" y="185" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• ArchUnit Architecture Tests</text>
          </g>

          <!-- Col 2 -->
          <g transform="translate(400, 0)">
            <text x="0" y="30" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#00ff9d">DATA &amp; ALGORITHMS</text>
            <text x="0" y="65" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• PostgreSQL 16 Serverless</text>
            <text x="0" y="95" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Tarjan's SCC Cycle Engine</text>
            <text x="0" y="125" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• HNSW Vector Similarity</text>
            <text x="0" y="155" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• SHA-256 Merkle Audit Chain</text>
            <text x="0" y="185" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• 7 Polymorphic Routing Rules</text>
          </g>

          <!-- Col 3 -->
          <g transform="translate(800, 0)">
            <text x="0" y="30" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#ffb800">FRONTEND &amp; EXPERIENCE</text>
            <text x="0" y="65" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• React 19 &amp; Vite Build Tool</text>
            <text x="0" y="95" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Live Campus Operational Stage</text>
            <text x="0" y="125" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Realtime SSE Reactive Stream</text>
            <text x="0" y="155" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Tailwind CSS &amp; Cyber Arcade UI</text>
            <text x="0" y="185" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Role-Based Session Switching</text>
          </g>

          <!-- Col 4 -->
          <g transform="translate(1200, 0)">
            <text x="0" y="30" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#ff3864">GROUP 76 · BITS HYD</text>
            <text x="0" y="65" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Srijan Shukla (2025A7PS0194H)</text>
            <text x="0" y="95" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Suhani Agarwal (2025ADPS0216H)</text>
            <text x="0" y="125" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Kartikey Negi (2025ADPS0129H)</text>
            <text x="0" y="155" font-family="'Segoe UI', sans-serif" font-size="15" fill="#ffffff">• Hairsh Kumar (2025A7PS0910H)</text>
            <text x="0" y="185" font-family="'Segoe UI', sans-serif" font-size="15" fill="#00f0ff">• CS F213 / MAC F212 OOP</text>
          </g>
        </g>
      </g>
    </g>
    '''
)

print(f"Generating {len(diagrams)} vector SVG diagrams...")
for diag_id, svg_content in diagrams.items():
    file_path = os.path.join(OUT_DIR, f"{diag_id}.svg")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"  ✓ Written: {file_path}")

print("All 15 SVG diagrams created successfully!")

