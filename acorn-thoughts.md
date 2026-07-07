# **Acorn & Holochain's Broader Implications: Three Contexts**

## **Analysis of the Acorn Outcome-Dependency Ontology Beyond Software Development**

---

## **Context and Framing**

The conversation between Eric (zippy) and Claude explored whether Acorn — a Holochain-based project management tool built around declarative outcome trees — could serve as an AI agent orchestration platform. The analysis concluded that this wasn't the right product positioning, but that Acorn's ontological concepts (declarative outcomes, uncertainty modelling, computed achievement propagation) have genuine value as a **human deliberation tool** that exports structured dependency trees for execution tools to consume. The P2P local LLM angle was identified as a potential differentiator rather than a liability.

This analysis examines the implications of these ideas — and more broadly, the Holochain protocol's architectural properties — across three contexts that extend well beyond software engineering.

**A note on scope:** This analysis examines the implications of Acorn's ontological approach and Holochain's architectural properties in each context. It does not assess Holochain's internal development maturity — that is a separate conversation. Where relevant, it poses questions about scale constraints that any protocol-level infrastructure must address.

---

## **1\. Values-Aligned Web3/4 Projects**

### **The Alignment Question**

The web3 ecosystem in 2025-2026 faces a credibility problem. The movement's stated values — data sovereignty, open source, digital commons, user ownership — sit in tension with the operational reality of many projects: venture-funded, speculative, and built on infrastructure that concentrates power in validators, exchanges, and protocol foundations. The Open Source Initiative's framing of digital sovereignty as requiring "day 0 integrity, day 1 resilience, and day 2 continuity" captures what the space claims to want but rarely delivers.

However, within the web3 space there exists a substantial and growing subset of projects using tokens not for speculation but as alternative, ethical, and equitable instruments for measuring and distributing real value. The Sarafu system in Kenya — a network of mutual credit community currencies now reaching over 55,000 users across both urban and rural communities — demonstrates what values-aligned tokenomics looks like in practice: tokens as claims against future goods and services, circulating within communities to connect local supply and demand when national currency is scarce. The Grassroots Economics research shows a 22% average income increase for participating businesses. Similar projects using tokens for commons stewardship, cooperative governance, and equitable resource distribution exist across the web3 landscape. A 2025 Frontiers in Blockchain research topic specifically examines tokenomics for sustainable development, documenting innovative ways blockchain systems facilitate value circulation through token types, incentive mechanisms, and governance models designed for social rather than speculative outcomes.

Acorn's ontological approach — and the Holochain protocol beneath it — addresses the broader web3 credibility gap in ways that deserve honest examination, and finds particularly strong alignment with this values-driven token ecosystem.

### **Where the Fit is Genuine**

**The outcome-tree ontology maps naturally to commons governance.** Digital commons projects — community land trusts, open-source protocol stewardship, cooperative resource management — face a persistent coordination challenge: how do you decompose a shared goal into verifiable sub-outcomes when there's no central authority to define "done"? Acorn's declarative framing ("the commons licensing framework has been adopted by all participating projects") combined with bottom-up computed achievement is structurally well-suited to this. It makes the decomposition of shared intent visible and navigable, which is precisely what governance-by-consensus needs to function.

**Holochain's agent-centric architecture genuinely delivers on data sovereignty claims.** Unlike blockchain-based web3 projects where "sovereignty" means "your data is on a public ledger controlled by validators," Holochain's architecture means each agent stores their own data, validates their own transactions, and participates in a DHT only for shared coordination. This is not marketing language — it's how the protocol actually works. For projects in the digital commons space (hREA/ValueFlows for economic coordination, Moss for groupware), the data sovereignty properties are real, not aspirational.

**The P2P LLM angle has specific relevance to open-source AI sovereignty.** The EU's digital sovereignty agenda, Hugging Face's open-source AI advocacy, and the broader movement toward locally-deployable models all point toward a future where organisations and communities run their own AI infrastructure. Holochain's P2P networking could serve as a coordination layer for pooling local inference resources across a community of practice. With 7-9B parameter models now running efficiently on consumer hardware via Ollama and llama.cpp, the technical floor for useful local AI has dropped substantially.

**Values-aligned tokenomics and Acorn's ontological approach are complementary, not opposed.** Projects designing mutual credit systems, community currencies, and equitable value-distribution tokens face precisely the governance and coordination challenges Acorn's ontology addresses. Designing a community currency requires structured deliberation about what the token represents, how value is measured, what outcomes the economic system serves, and how accountability works. The Sarafu Network's experience — navigating questions of token issuance, community governance, and redemption commitments — is exactly the kind of multi-stakeholder deliberation that benefits from explicit outcome modelling. hREA, the Holochain implementation of the ValueFlows economic vocabulary (itself grounded in REA accounting theory), already provides the backend infrastructure for tracking multi-dimensional resource flows. Acorn could serve as the deliberation layer that sits above hREA's coordination primitives, helping communities decide what their economic system should achieve before building it.

### **Where Questions Remain**

**Network effects operate at the hApp level, not the protocol level.** Holochain is a protocol; network effects are realised by people using hApps built on top of it. The relevant question isn't "does Holochain have enough users?" but "can specific hApps like Acorn achieve critical mass within their target communities?" This is a go-to-market and ecosystem development question, not a technical one. Moss (the Holochain-based collaboration suite) and hREA are building user bases within specific communities of practice. The question is whether Acorn can do the same — and whether the hApp ecosystem collectively reaches the threshold where Holochain-as-protocol becomes the obvious substrate.

**Scale constraints need honest assessment.** Any protocol serving as infrastructure for commons governance and community currencies must handle the coordination load those use cases generate. The Sarafu Network processed hundreds of thousands of transactions across 55,000 users. Community governance for a mid-sized open source project might involve hundreds of simultaneous deliberation threads. What are Holochain's current practical limits for concurrent agents, DHT gossip under high load, and cross-DNA coordination? These are engineering questions that deserve concrete answers rather than architectural hand-waving.

### **Net Assessment**

For values-aligned web3/4 projects, the ontological ideas are genuinely valuable and the architectural properties are genuinely differentiated. The fit is particularly strong with the ethical tokenomics ecosystem — projects using tokens for mutual credit, community currencies, and equitable value distribution — where structured deliberation about what economic systems should achieve is core to the work. The combination of Acorn's outcome ontology, hREA's economic coordination primitives, and Holochain's agent-centric architecture represents a coherent stack for values-aligned economic infrastructure. The binding questions are about scale constraints and the hApp-level adoption dynamics that would make this stack the natural choice for these communities.

---

## **2\. The Impact Sector and Global South**

### **The Infrastructure Reality**

The digital divide between industrialised nations and the Global South is not closing fast enough. Research consistently identifies the same barriers: inadequate internet infrastructure, unreliable electricity, high costs of connectivity and devices, and limited digital literacy. The UN estimates only 36% of the population in least-developed countries uses the internet. In 2025-2026, while developed nations deploy 5G, many low-income countries still operate on 2G and 3G networks.

Within this context, peer-to-peer and resource-light applications have a specific — not universal — set of advantages. But the tools currently available to organisations working in these contexts deserve scrutiny, not just the alternatives.

### **The Problem with Current Coordination Tools**

**WhatsApp is not coordination infrastructure — it's what people use when they have no other choice.** WhatsApp's dominance in Global South coordination — among NGOs, community organisations, and informal economic networks — is a function of its accessibility (Meta has negotiated zero-rating deals with local telcos) and its ubiquity, not its fitness for purpose. Data generated in WhatsApp stays trapped in WhatsApp. Coordination threads are lost in chat histories. Decision rationale is buried. Institutional knowledge walks out the door when a staff member's phone breaks. The metadata — who communicated with whom, when, at what frequency — flows to Meta's servers regardless of end-to-end encryption, creating surveillance exposure for vulnerable populations.

Russia's full blocking of WhatsApp in 2025, affecting 100 million users, demonstrated the fragility of building coordination infrastructure on a single corporation's platform. India's growing regulatory pressure on WhatsApp's data practices raises similar concerns. For development organisations and community networks, WhatsApp dependency creates profound data sovereignty, continuity, and equity problems. It is the best coordination tool for those who have no other choice — which is precisely the problem.

Similarly, spreadsheets and email threads remain default tools for programme planning, not because they serve the purpose well, but because they're available. Data in spreadsheets is siloed, version control is manual, and the relationship between planned outcomes and actual progress is maintained through human effort rather than structural design. These tools deliver coordination, but at enormous hidden cost in institutional memory, data integrity, and equitable access to information.

### **Where Holochain's Architecture Genuinely Helps**

**Offline-first operation by design.** Holochain applications operate on the local device. When connectivity is available, they sync with peers and resolve any divergences. When connectivity drops — which in many Global South contexts means hours or days, not minutes — the application continues to function. This isn't an afterthought or a "graceful degradation" — it's how the protocol fundamentally works.

**Lightweight computational requirements — with open questions.** Holochain validates only the agent's own transactions and their portion of the DHT, rather than requiring every node to process all global state. This is architecturally lighter than blockchain alternatives. Holochain's node architecture distinguishes between zero-arc nodes (lightweight clients that don't hold DHT data), edge nodes (always-on infrastructure for data availability and relay), and full-arc nodes (holding complete DHT data). This layered approach means participation doesn't require a single hardware profile. The question is: what is the practical minimum hardware floor for meaningful participation in each role? Can a mid-range Android phone run a zero-arc node usefully? Can a community organisation's single desktop serve as an edge node for its local network? These are testable engineering questions that would determine the real accessibility envelope.

**Zero transaction fees.** In economies where a single mobile money transaction fee can represent a meaningful percentage of a day's income, the absence of per-transaction costs is not a minor feature. It changes who can afford to participate and how frequently.

**Data sovereignty that matters for development.** When a community organisation coordinates through Holochain, the data about their coordination — their plans, their progress, their institutional knowledge — stays on their devices and in their network. It doesn't flow to a Silicon Valley data centre. It isn't used to train someone else's models. It isn't subject to a foreign jurisdiction's data access laws. For development contexts where data extraction by international actors is itself a form of exploitation, this matters.

### **Where the Acorn Ontology Specifically Applies**

**Development programme planning is structurally an outcome tree.** The IASC Humanitarian Programme Cycle — needs assessment, strategic planning, resource mobilisation, implementation, monitoring — maps directly to Acorn's ontological structure. But more importantly, the distinction between task completion and outcome achievement is precisely what development planning struggles with. An NGO can complete all planned activities (wells drilled, trainings delivered, materials distributed) and still fail at the outcome level (community water access hasn't improved because of maintenance failures, social dynamics, or political interference). Existing project management tools like NGO Online, OpenProject, or Google Workspace track tasks. Acorn's ontology tracks whether the actual state of the world has moved toward the desired state — and models the uncertainty involved.

**The P2P local AI angle strengthens in this context.** Edge AI deployment in resource-constrained environments is an active area of development: 7-9B parameter models running on consumer hardware, quantisation techniques that reduce memory requirements by 75% while preserving accuracy, and edge AI architectures delivering up to 75% energy savings versus cloud-dependent alternatives. For communities without reliable internet access, the ability to run useful AI assistance locally — for translation, agricultural advisory, health information — matters more, not less. Holochain's P2P coordination could enable communities to pool local inference resources, creating shared AI capacity without cloud dependency.

### **Where the Fit is Problematic — and Where That Creates Opportunity**

**The "Northern-centric model" critique is valid — and productive.** Acorn was designed by and for knowledge workers in a Western context. Its DAG-based outcome decomposition, its digital-first interface assumptions, and its implicit model of how groups deliberate all carry cultural assumptions. Some communities plan through narrative, relationships, and elder consultation rather than through visual decomposition diagrams. This is a real limitation — but it's also a design opportunity. The underlying ontological primitives (desired states, current states, uncertainty, dependency, achievement) are culturally universal even if their visual representation is not. A tool like Acorn could be refactored: outcome trees rendered as structured conversations rather than visual DAGs; voice-first interfaces for oral culture contexts; community-specific templates that map the ontology to local planning traditions. The question is whether the architecture is flexible enough to support radically different interaction paradigms while preserving the structural benefits of the underlying model.

**Competing with simplicity requires offering something simplicity can't.** The advantage of existing tools isn't just accessibility — it's simplicity. Any alternative must justify its additional complexity by delivering something those tools genuinely cannot. What WhatsApp and spreadsheets cannot offer: data sovereignty, structural integrity of coordination knowledge, portability across platforms and contexts, outcome-level tracking that distinguishes activity from impact, and resilience against the loss or departure of any single coordinator. If an Acorn-like tool can deliver these properties at a comparable usability threshold, it isn't competing with WhatsApp — it's offering what WhatsApp cannot.

### **Net Assessment**

The Impact Sector / Global South context is more nuanced than the web3 case. Holochain's architectural properties (offline-first, lightweight, zero-fee, P2P data sovereignty) are genuinely well-matched to infrastructure constraints. The outcome-tree ontology maps surprisingly well to development planning frameworks, and the distinction between task completion and outcome achievement addresses a genuine gap in existing tools. The WhatsApp/spreadsheet status quo isn't something to compete against — it's something to liberate people from.

The realistic target population is community organisations, local NGOs, and field offices where devices and basic literacy are available but cloud infrastructure is not — a meaningful population, and one that is systematically underserved by current tools. The hardware floor question (what can a zero-arc node run on? can an edge node serve a local network from modest hardware?) will determine how wide that population actually is. The cultural adaptation question (can the ontology be rendered through interaction paradigms that aren't Western-knowledge-worker-centric?) will determine whether the tool serves or alienates its users.

---

## **3\. Humanitarian Contexts and Oppressive Regimes**

### **The Stakes Change Everything**

When the cost of a tool failing is not a missed deadline but a person's imprisonment, torture, or death, every design decision becomes a life-safety question. This context demands the highest standard of scrutiny, and optimistic assessments of potential should be treated with appropriate caution.

That said, this context cannot be analysed in isolation.

### **The Cross-Context Reality**

**People operating under oppression do not exist solely within that context.** A dissident in Syria is likely coordinating with supporters in Germany. A journalist in Myanmar communicates with editors in Thailand and publishers in the UK. Humanitarian workers in active conflict zones report to field offices in neighbouring countries and headquarters in Geneva. Diaspora networks are consistently among the first international responders to crisis — the Somali diaspora remits over $1.7 billion annually; Congolese diaspora organisations were documented operating across Europe, North America, and East Africa in the 2025 Kivu crisis.

The IOM Framework for Diaspora Engagement in Humanitarian Assistance, developed with Haiti Renewal Alliance and supported by DEMAC (Diaspora Emergency Action & Coordination), explicitly acknowledges that humanitarian coordination operates across contexts — from crisis zones to stable countries, from field to headquarters, from affected populations to diaspora networks.

This cross-context reality fundamentally changes how we should evaluate a tool like Acorn in this space. The question is not "can a person under active threat use a complex deliberation tool?" — the answer to that narrow question is obviously "probably not in the moment of crisis." The question is: **can a tool span contexts, so that structured deliberation happens where conditions allow it, and the resulting decisions flow to those in the crisis zone as actionable guidance?**

### **What Actually Works Under Oppression: Evidence from the Field**

Briar — audited by Cure53, designed for internet shutdowns — was used during Iran's January 2026 shutdown (85 million people cut off) and Myanmar's 2021 coup for protest coordination via Bluetooth and Wi-Fi mesh. Its design principles are instructive: works without internet, works without centralised infrastructure, designed so that the physical inspection of a device reveals as little as possible. Activists explicitly need applications that cannot be easily identified during physical controls.

The Bitcoin Humanitarian Alliance formed in 2025 specifically because censorship-resistant financial infrastructure enables humanitarian work where traditional banking fails. Sudan's Emergency Response Rooms coordinate mutual aid through microgrants with decision-making led by local coordination councils — a distributed model that survives because no single node's capture compromises the whole.

These examples share a common architecture: distributed coordination where the full picture only assembles across the network, not on any single device.

### **Where Holochain's Properties Apply**

**No central server to seize or block.** This is the most directly relevant architectural property. Holochain applications create encrypted P2P networks between participants. There is no server to compel to hand over data, no domain to block, no company to issue a takedown order to. This is the same property that makes Briar valuable — but Holochain provides it as a general-purpose application protocol, not just for messaging.

**Cryptographic audit trails without centralised records.** Holochain's source chain architecture means each participant has a tamper-evident record of their own actions, validated by peers. For human rights documentation — recording extrajudicial killings, documenting disappeared persons, tracking aid distribution — this provides evidentiary integrity without requiring a central database that could be seized or destroyed.

**Data stays on the device by default.** Holochain stores all data locally, with sharing being an explicit action. This is a genuine privacy advantage in contexts where device seizure is common: you control exactly what's on your device and what's been shared to the DHT.

### **Where Acorn's Ontology Applies — Through Cross-Context Coordination**

**Distributed deliberation serves the crisis zone by operating beyond it.** A diaspora support network in Berlin, an advocacy group in Geneva, and field coordinators in a conflict zone can share a common outcome tree. The strategic deliberation — decomposing goals, modelling uncertainty, evaluating dependencies — happens where participants have the cognitive bandwidth and safety to do it properly. The person on the ground in the crisis zone receives not a complex decision tree to navigate, but the resulting actionable guidance: clear priorities, pre-reasoned decisions, contingency branches for predictable scenarios. The deliberation tool distributes decision-making power across contexts, so that those in the crisis zone can take action with confidence that the reasoning behind it has been thorough. This is structurally how diaspora humanitarian coordination already works — DEMAC documents diaspora organisations doing exactly this, coordinating from abroad with local partners on the ground. The gap is that current coordination happens through WhatsApp groups and email chains where the reasoning behind decisions is lost, institutional knowledge doesn't persist, and the full picture of what's planned versus what's achieved is invisible.

**Structured documentation of desired vs. actual states serves accountability.** Human rights organisations documenting abuses need structured frameworks: what was the desired state (civilians protected by international humanitarian law), what is the actual state (documented violations), what evidence supports the gap. Acorn's ontology of desired states with verifiable achievement criteria maps to this evidentiary structure. When the documentation network spans multiple countries, the P2P architecture means the complete record assembles across the network without any single jurisdiction being able to destroy or suppress it.

### **Where the Fit is Dangerous or Inadequate — and Must Be Addressed**

**Holochain has not been security-audited for adversarial state contexts.** Briar was audited by Cure53. It is specifically designed to resist an adversary that comprehensively monitors all long-range communications. Holochain's threat model is not designed for this scenario. Its DHT gossip protocol, peer discovery mechanisms, and networking layer have not been evaluated against a sophisticated state adversary. Using Holochain in an oppressive regime context without this level of security validation would carry unacceptable risks.

**Mobile-first design is non-negotiable.** The relevant device in humanitarian and oppression contexts is a smartphone — often a low-end Android device. An Electron desktop app is a non-starter for field-level work. Holochain's evolving node architecture (zero-arc nodes, edge nodes, cloud nodes) suggests a path toward lightweight mobile participation, but the question is how far along that path the protocol actually is, and what capabilities a mobile participant would have.

**Network formation is surveillance-visible.** Holochain's P2P networking requires devices to discover and connect to each other. In a monitored environment, the pattern of devices connecting to form a new network is itself a signal that could attract attention. Briar mitigates this through Tor integration for long-range communications and limits short-range to Bluetooth, which is harder to monitor at scale. Holochain's networking approach would need similar hardening.

**The "tool-on-a-phone" problem.** If an activist's phone is confiscated and the Holochain conductor is found running with data about resistance coordination, the consequences are severe. Tools for this context need either strong encryption of data at rest or the ability to be quickly destroyed/hidden. This is a design requirement that any protocol serving this context must address.

**Detection risk must be a first-order design consideration.** Myanmar research specifically identified the need for applications that cannot be easily identified during physical controls. Holochain-based tools for this context would need to address not just data security but operational security — the ability to disguise or quickly remove the application itself.

### **The Honest Assessment: What's Real and What's Aspirational**

The humanitarian/oppressive regime context reveals genuine tensions between architectural potential and operational readiness, but the cross-context framing changes the calculus significantly.

A tool that must function entirely within the crisis zone, for users entirely under active threat, faces an almost impossible set of requirements. But that's not how humanitarian coordination works. It works across contexts — diaspora to field, headquarters to frontline, stable country to conflict zone. A P2P deliberation tool that enables structured planning and accountability across these contexts, while ensuring that participants in the crisis zone have minimal exposure and maximum actionable clarity, addresses a real gap.

The security concerns are not dismissable. They must be addressed through formal auditing by researchers experienced in adversarial contexts — the Open Technology Fund, which funded Briar, is the obvious partner. But the approach to hardening should account for the cross-context reality: the threat model isn't solely "all participants are under active surveillance," but rather "some participants are under active surveillance while others are in relatively safe environments, and the tool must protect the exposed participants while enabling the full network to coordinate."

Briar demonstrates that P2P tools can work under oppression, but Briar is limited to messaging. Holochain could enable a broader set of P2P applications — coordination, documentation, resource tracking, structured deliberation — across the same spectrum of contexts. The question is whether the Holochain ecosystem will do the security work required to make this safe.

---

## **Synthesis: What This Means**

Across all three contexts, a consistent pattern emerges:

**Holochain's architectural properties are genuinely differentiated and genuinely relevant.** Agent-centric computing, offline-first operation, zero-fee transactions, P2P networking without central servers, local data sovereignty — these aren't web3 marketing language. They're real architectural properties that address real constraints in each of these contexts.

**Acorn's ontological ideas have broader applicability than software development.** Declarative outcome trees with uncertainty modelling and computed achievement propagation map to community currency governance, development planning frameworks, commons stewardship, and humanitarian programme cycles. These domains already use structurally similar frameworks, just implemented in tools — WhatsApp, spreadsheets, email chains — that trap the data, lose the reasoning, and dissolve institutional memory.

**The network effects question operates at the hApp level.** Holochain is a protocol. The relevant adoption question is whether specific hApps — Acorn, hREA, Moss — can achieve critical mass within their target communities. The hApp ecosystem, and the ValueFlows interoperability standard that connects them, is the layer where network effects materialise.

**The P2P local LLM angle gets more interesting, not less, as you move into resource-constrained contexts.** The convergence of small language models (7-9B parameters on consumer hardware), P2P coordination protocols, and the need for AI capabilities in environments without reliable cloud access points toward a genuine opportunity. Communities without cloud access need local AI more, not less, and Holochain's coordination primitives could enable pooled community inference capacity.

**Scale constraints need honest, testable answers.** What are the practical limits for concurrent agents? How does DHT gossip perform under realistic load for the use cases described here? Can edge nodes serve as reliable infrastructure for a community network? What's the minimum viable hardware for meaningful participation? These are questions that should be posed concretely and answered through testing, not assumed away by architectural elegance.

**The cross-context reality is the key insight.** Every context examined involves participants operating across different conditions — values-aligned projects spanning jurisdictions, development organisations bridging infrastructure divides, humanitarian networks connecting crisis zones with stable countries. A P2P protocol that enables coordination across these gradients, rather than assuming all participants share identical constraints, has a fundamentally different value proposition than one designed for a single homogeneous context.

**The cultural adaptation opportunity is real.** The Northern-centric design critique, rather than being a fatal flaw, identifies a design frontier. The underlying ontological primitives (desired states, current states, uncertainty, dependency, achievement) are culturally universal. The challenge — and opportunity — is rendering them through interaction paradigms appropriate to radically different contexts. If the architecture supports this flexibility, it opens rather than closes possibilities.

The question this analysis returns to, across all three contexts: Holochain's properties address real needs in each domain. The binding constraints are the practical engineering and go-to-market questions — scale limits, hardware floor, security hardening, cultural adaptation, and hApp-level adoption — that determine whether architectural potential translates to operational reality. These are testable questions with discoverable answers, which is the right kind of uncertainty to have.

