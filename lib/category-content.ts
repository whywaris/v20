// Intro (shown under the category title and used as the meta description) and a longer
// "About" section (shown below the article list) for each blog category, keyed by categorySlug().
// A category without an entry falls back to the article count.

export type CategoryContent = { intro: string; body: string };

const HOW_WE_WRITE = `### How we write these guides

Every guide is written for small and new channels, not for creators who already have a big audience. We explain the method, show the steps and point out the common mistakes. We don't promise views or income, and we say so when something depends on luck, timing or your audience. YouTube's rules change often, so we link to YouTube's official help pages and ask you to check them before you act. Read more [about YT Niches](/about) and our [Earnings Disclaimer](/disclaimer).`;

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  faceless: {
    intro: 'Guides for starting and running a YouTube channel without showing your face: ideas, scripts, tools, copyright and a weekly workflow you can keep up.',
    body: `## About Faceless

This category is for people who want to build a YouTube channel without appearing on camera. Some readers are shy, some don't have a quiet place to record, and some simply prefer to let the work speak for itself. A faceless channel can teach, explain and entertain as well as any other channel, but it asks more from the script, the visuals and the planning.

### Who it's for

- Beginners who want to start a channel but don't want to show their face or use their voice
- Solo creators who need a realistic production routine
- Anyone who wants to avoid the originality and copyright mistakes that hold faceless channels back

### What you'll learn here

- **Channel ideas that work without a face or voiceover,** such as screen-recorded tutorials, hands-only videos, text-based explainers and timelapse or process videos, with what each format needs
- **How to write scripts for faceless videos,** from the hook to the ending, including a two-column format that plans words and visuals together
- **Free tools for each stage,** from screen recording and editing to thumbnails and audio, with a method for testing them on your own computer
- **Stock footage, music and copyright:** which licenses allow monetized use, what to avoid and how to keep records that protect your channel
- **A weekly workflow** for producing videos alone, with batching, templates and ways to avoid burnout
- **Starting the channel itself,** step by step, in our guide to [starting a faceless YouTube channel](/blog/how-to-start-faceless-youtube-channel)

### What you get from these guides

Practical checklists, templates you can copy and honest notes on the limits of each method. We pay special attention to YouTube's rules on reused and mass-produced content, because faceless channels run into them more often than most. The goal is a channel that adds real value in every video, so it can grow and stay eligible to earn.

${HOW_WE_WRITE}`,
  },

  monetization: {
    intro: 'Plain-language guides to how YouTube creators earn: RPM and CPM, the Partner Program, Shorts vs long-form, avoiding limited ads and income beyond AdSense.',
    body: `## About Monetization

This category explains how money on YouTube actually works, without the inflated screenshots and guaranteed-income promises you see elsewhere. You'll learn what the numbers in YouTube Studio mean, what affects them and what you can realistically influence.

### Who it's for

- New creators working toward the YouTube Partner Program
- Creators who see RPM and CPM figures online and want to know what they really mean
- Faceless and solo channels that want income from more than one source

### What you'll learn here

- **RPM and CPM explained simply,** with a worked example showing why the two numbers are so different
- **What affects your RPM,** including audience location, topic, video length and season, and how to check each one in your own analytics
- **The Partner Program requirements,** the two entry tiers and the changes announced for new applicants
- **Shorts vs long-form monetization,** why per-view earnings differ and how to use each format
- **How to avoid limited ads and demonetization,** including the difference between advertiser-friendly rules and channel eligibility rules
- **Ways to earn beyond AdSense,** such as affiliate links, sponsorships, digital products, services and an email list, each with a simple first test
- **Typical rate ranges by niche** in our [YouTube RPM benchmark report](/blog/youtube-rpm-benchmarks), treated as rough estimates, not predictions

### What you get from these guides

Clear explanations, worksheets for reading your own data and checklists for staying within YouTube's policies. We don't predict what you will earn. The only figures that matter for your channel are the ones in your own YouTube Studio, and we show you how to read them.

${HOW_WE_WRITE}`,
  },

  'niche-research': {
    intro: 'How to choose a YouTube niche with evidence instead of guesswork: validating ideas, finding gaps, beginner-friendly options and the mistakes to avoid.',
    body: `## About Niche Research

Choosing a niche is the first big decision a creator makes, and it shapes everything after it. This category helps you make that choice with evidence. Instead of picking a topic because it sounds profitable or popular, you'll learn to check real demand, real competition and whether you can keep making videos about it for a long time.

### Who it's for

- Beginners who don't know what their channel should be about
- Creators comparing two or three ideas before committing
- Existing channels that feel stuck and want to narrow or adjust their focus

### What you'll learn here

- **How to validate a niche in about 30 minutes** with free tools and a simple scorecard
- **How to find niche gaps** using YouTube search suggestions and the comments under existing videos
- **Beginner-friendly niches** that need little equipment and suit a faceless format, plus how to pick the one that fits your time and skills
- **Evergreen vs trending topics,** and how to mix the two
- **The most common niche mistakes,** such as choosing only for money or going too broad, and how to fix them
- **How to study a small channel's growth** using only public information
- **Topic ideas with lighter competition** in our guide to [low-competition niches for solo creators](/blog/top-low-competition-youtube-niches)

### What you get from these guides

Step-by-step methods, scorecards and checklists you can run on your own ideas. We encourage you to look for proof from small channels, not just large ones, and to treat any single example as a clue rather than a rule. A careful choice at the start can save months of publishing into a topic that was never going to grow.

${HOW_WE_WRITE}`,
  },

  'outlier-strategy': {
    intro: 'Learn what outlier videos are, how to find them for free and how to learn from them without copying, plus how to read CTR and retention on your own channel.',
    body: `## About Outlier Strategy

An outlier video is one that gets far more views than its channel normally does. Studying outliers is one of the most useful research habits a small creator can build, because it shows which topics and packaging connected with viewers beyond a channel's existing audience. It's also easy to do badly. This category teaches the method and the mistakes.

### Who it's for

- Creators looking for video ideas backed by evidence
- Anyone who has tried copying a successful video and wondered why it didn't work
- Channel owners who want to understand their own click-through rate and retention

### What you'll learn here

- **What an outlier video is,** how to measure it with a simple ratio and why the median matters
- **How to find outliers manually,** with YouTube search, channel pages and a free spreadsheet
- **How to analyze titles and thumbnails** across many outliers and compare them with ordinary videos
- **How to model a winning video without copying it,** by separating the principle from the specific expression
- **The most common outlier mistakes,** such as trusting a single example or ignoring timing and context
- **How to read CTR and retention** in YouTube Studio and decide what to fix next
- **The patterns behind outliers** in our breakdown of the [YouTube outlier video formula](/blog/youtube-outlier-video-formula)

### What you get from these guides

Repeatable research methods, logs and worksheets, and checklists to run before you publish. We are careful about what can and can't be known from outside a channel: nobody can see another creator's click-through rate or retention, so we treat patterns as hypotheses to test, not rules. Every guide pushes you to add your own angle and value, which is better for viewers and safer under YouTube's originality rules.

${HOW_WE_WRITE}`,
  },
};

export const categoryContent = (slug: string): CategoryContent | undefined => CATEGORY_CONTENT[slug];
