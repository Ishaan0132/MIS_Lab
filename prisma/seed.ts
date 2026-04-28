import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.report.deleteMany()
  await prisma.bugReport.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.server.deleteMany()
  await prisma.player.deleteMany()
  await prisma.game.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log('Creating users...')
  const admin = await prisma.user.create({
    data: {
      id: 'user_admin_001',
      email: 'admin@videogame.com',
      password: hashPassword('admin123'),
      name: 'Admin User',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const developer = await prisma.user.create({
    data: {
      id: 'user_dev_001',
      email: 'developer@videogame.com',
      password: hashPassword('dev123'),
      name: 'Developer User',
      role: 'DEVELOPER',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const manager = await prisma.user.create({
    data: {
      id: 'user_mgr_001',
      email: 'manager@videogame.com',
      password: hashPassword('manager123'),
      name: 'Manager User',
      role: 'MANAGER',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  console.log('Created 3 users')

  // Create games
  console.log('Creating games...')
  const games = await Promise.all([
    prisma.game.create({
      data: {
        id: 'game_001',
        title: 'Galaxy Warriors Online',
        genre: 'Action',
        releaseDate: new Date('2022-03-15'),
        status: 'ACTIVE',
        playerCount: randomInt(50000, 150000),
        createdAt: new Date()
      }
    }),
    prisma.game.create({
      data: {
        id: 'game_002',
        title: 'Realm of Legends',
        genre: 'RPG',
        releaseDate: new Date('2021-08-20'),
        status: 'ACTIVE',
        playerCount: randomInt(80000, 200000),
        createdAt: new Date()
      }
    }),
    prisma.game.create({
      data: {
        id: 'game_003',
        title: 'Cyber Racing League',
        genre: 'Racing',
        releaseDate: new Date('2023-01-10'),
        status: 'ACTIVE',
        playerCount: randomInt(30000, 80000),
        createdAt: new Date()
      }
    }),
    prisma.game.create({
      data: {
        id: 'game_004',
        title: 'Strategic Conquest',
        genre: 'Strategy',
        releaseDate: new Date('2020-11-05'),
        status: 'MAINTENANCE',
        playerCount: randomInt(20000, 50000),
        createdAt: new Date()
      }
    }),
    prisma.game.create({
      data: {
        id: 'game_005',
        title: 'Horror Nights',
        genre: 'Horror',
        releaseDate: new Date('2023-06-01'),
        status: 'ACTIVE',
        playerCount: randomInt(15000, 40000),
        createdAt: new Date()
      }
    }),
    prisma.game.create({
      data: {
        id: 'game_006',
        title: 'Battle Royale X',
        genre: 'FPS',
        releaseDate: new Date('2022-09-15'),
        status: 'ACTIVE',
        playerCount: randomInt(100000, 250000),
        createdAt: new Date()
      }
    }),
    prisma.game.create({
      data: {
        id: 'game_007',
        title: 'Puzzle Master',
        genre: 'Puzzle',
        releaseDate: new Date('2023-03-20'),
        status: 'ACTIVE',
        playerCount: randomInt(10000, 30000),
        createdAt: new Date()
      }
    }),
    prisma.game.create({
      data: {
        id: 'game_008',
        title: 'Sports Championship',
        genre: 'Sports',
        releaseDate: new Date('2021-06-10'),
        status: 'DEPRECATED',
        playerCount: randomInt(5000, 15000),
        createdAt: new Date()
      }
    })
  ])

  console.log('Created 8 games')

  // Create players
  console.log('Creating players...')
  const playerStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'BANNED']
  const players = []
  
  for (let i = 0; i < 100; i++) {
    const player = await prisma.player.create({
      data: {
        id: `player_${String(i).padStart(3, '0')}`,
        username: `Player${i + 1}_${randomInt(1000, 9999)}`,
        email: `player${i + 1}_${randomInt(100, 999)}@game.com`,
        level: randomInt(1, 100),
        xp: randomInt(0, 1000000),
        totalPlayTime: randomInt(10, 10000),
        lastLogin: Math.random() > 0.3 ? randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) : null,
        status: randomElement(playerStatuses),
        createdAt: randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date())
      }
    })
    players.push(player)
  }

  console.log('Created 100 players')

  // Create purchases
  console.log('Creating purchases...')
  const itemTypes = ['skin', 'weapon', 'currency', 'battle_pass', 'character', 'vehicle', 'emote', 'bundle']
  const purchaseStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING', 'FAILED']
  const itemNames: Record<string, string[]> = {
    skin: ['Dragon Armor', 'Neon Outfit', 'Cyber Suit', 'Golden Wings', 'Shadow Cloak', 'Phoenix Dress', 'Arctic Camo', 'Royal Robe'],
    weapon: ['Plasma Rifle', 'Dark Blade', 'Thunder Bow', 'Frost Staff', 'Fire Cannon', 'Venom Dagger', 'Lightning Hammer', 'Storm Spear'],
    currency: ['1000 Gems', '5000 Coins', '100 Diamonds', 'Premium Credits', 'Gold Pack', 'Crystal Bundle'],
    battle_pass: ['Season Pass', 'Elite Pass', 'Pro Pass', 'Ultimate Pass'],
    character: ['Ninja Master', 'Space Commander', 'Dark Knight', 'Speed Racer', 'Mystic Mage', 'Cyborg Hunter'],
    vehicle: ['Hover Bike', 'Sports Car', 'Jet Plane', 'Racing Boat', 'Armored Tank', 'Dragon Mount'],
    emote: ['Victory Dance', 'Wave Hello', 'Cool Moves', 'Celebration', 'Taunt', 'Laugh'],
    bundle: ['Starter Pack', 'Ultimate Bundle', 'VIP Pack', 'Legendary Bundle', 'Power Pack']
  }

  for (let i = 0; i < 250; i++) {
    const itemType = randomElement(itemTypes)
    await prisma.purchase.create({
      data: {
        id: `purchase_${String(i).padStart(3, '0')}`,
        playerId: randomElement(players).id,
        gameId: randomElement(games).id,
        itemType,
        itemName: randomElement(itemNames[itemType] || ['Mystery Item']),
        amount: parseFloat((Math.random() * 99 + 0.99).toFixed(2)),
        currency: 'USD',
        status: randomElement(purchaseStatuses),
        createdAt: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date())
      }
    })
  }

  console.log('Created 250 purchases')

  // Create servers
  console.log('Creating servers...')
  const servers = await Promise.all([
    prisma.server.create({
      data: {
        id: 'server_001',
        name: 'US-East-01',
        region: 'North America',
        status: 'ONLINE',
        playerCount: randomInt(500, 1000),
        maxPlayers: 1000,
        cpuUsage: parseFloat((Math.random() * 60 + 20).toFixed(2)),
        memoryUsage: parseFloat((Math.random() * 50 + 30).toFixed(2)),
        lastPing: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.server.create({
      data: {
        id: 'server_002',
        name: 'US-West-01',
        region: 'North America',
        status: 'ONLINE',
        playerCount: randomInt(400, 1000),
        maxPlayers: 1000,
        cpuUsage: parseFloat((Math.random() * 60 + 20).toFixed(2)),
        memoryUsage: parseFloat((Math.random() * 50 + 30).toFixed(2)),
        lastPing: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.server.create({
      data: {
        id: 'server_003',
        name: 'EU-Central-01',
        region: 'Europe',
        status: 'ONLINE',
        playerCount: randomInt(600, 1000),
        maxPlayers: 1000,
        cpuUsage: parseFloat((Math.random() * 60 + 20).toFixed(2)),
        memoryUsage: parseFloat((Math.random() * 50 + 30).toFixed(2)),
        lastPing: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.server.create({
      data: {
        id: 'server_004',
        name: 'EU-West-01',
        region: 'Europe',
        status: 'MAINTENANCE',
        playerCount: 0,
        maxPlayers: 1000,
        cpuUsage: 0,
        memoryUsage: 0,
        lastPing: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.server.create({
      data: {
        id: 'server_005',
        name: 'Asia-Pacific-01',
        region: 'Asia',
        status: 'ONLINE',
        playerCount: randomInt(700, 1000),
        maxPlayers: 1000,
        cpuUsage: parseFloat((Math.random() * 60 + 20).toFixed(2)),
        memoryUsage: parseFloat((Math.random() * 50 + 30).toFixed(2)),
        lastPing: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.server.create({
      data: {
        id: 'server_006',
        name: 'SA-Brazil-01',
        region: 'South America',
        status: 'OFFLINE',
        playerCount: 0,
        maxPlayers: 1000,
        cpuUsage: 0,
        memoryUsage: 0,
        lastPing: new Date(Date.now() - 5 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.server.create({
      data: {
        id: 'server_007',
        name: 'Oceania-Sydney-01',
        region: 'Oceania',
        status: 'ONLINE',
        playerCount: randomInt(200, 500),
        maxPlayers: 500,
        cpuUsage: parseFloat((Math.random() * 40 + 10).toFixed(2)),
        memoryUsage: parseFloat((Math.random() * 30 + 20).toFixed(2)),
        lastPing: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.server.create({
      data: {
        id: 'server_008',
        name: 'Asia-Tokyo-01',
        region: 'Asia',
        status: 'ONLINE',
        playerCount: randomInt(800, 1500),
        maxPlayers: 1500,
        cpuUsage: parseFloat((Math.random() * 70 + 20).toFixed(2)),
        memoryUsage: parseFloat((Math.random() * 60 + 30).toFixed(2)),
        lastPing: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  console.log('Created 8 servers')

  // Create bug reports
  console.log('Creating bug reports...')
  const bugTitles = [
    'Game crashes on startup',
    'Unable to connect to multiplayer',
    'Texture flickering in level 5',
    'Achievement not unlocking',
    'Audio desync in cutscenes',
    'Save file corruption issue',
    'Character model clipping',
    'Login timeout error',
    'Memory leak after extended play',
    'Quest objective not updating',
    'UI text overlapping',
    'Microphone not detected',
    'Particle effects causing lag',
    'Inventory items disappearing',
    'In-app purchase not processing',
    'Controller mapping issues',
    'Shadow rendering bug',
    'Network latency spike',
    'Incorrect damage calculation',
    'Map boundary exploit',
    'NPC pathfinding broken',
    'Weather system glitch',
    'Leaderboard not updating',
    'Screenshot function broken',
    'Localization text missing',
    'Weapon switching delay',
    'Crosshair alignment off',
    'Vehicle physics glitch',
    'Water reflection artifacts',
    'Lighting flicker indoors',
    'Menu navigation lag',
    'Voice chat echo',
    'Save sync failure',
    'Currency display bug',
    'Skill cooldown visual error'
  ]

  const bugDescriptions = [
    'Steps to reproduce:\n1. Launch the game\n2. Navigate to settings\n3. Change resolution\nExpected: Resolution changes\nActual: Game crashes',
    'The issue occurs randomly during gameplay. No specific pattern identified yet.',
    'This bug affects all players in our guild. We have tested on multiple devices.',
    'Critical issue blocking progression. Needs immediate attention.',
    'Minor visual glitch that doesn\'t affect gameplay but looks bad.',
    'Please investigate this issue. Multiple reports from players.',
    'Bug introduced in the latest patch. Was working fine before.',
    'Happens only on specific hardware configurations.',
    'Workaround available: Restart the game every 30 minutes.',
    'This is blocking the weekly challenge completion.',
    'Reported by 50+ players in the last 24 hours.',
    'Affects PvP matchmaking significantly.'
  ]

  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  const bugStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

  for (let i = 0; i < 40; i++) {
    const status = randomElement(bugStatuses)
    const severity = randomElement(severities)
    const reportedBy = randomElement([admin.id, developer.id, manager.id])
    const assignedTo = status !== 'OPEN' ? randomElement([developer.id, manager.id]) : null
    
    await prisma.bugReport.create({
      data: {
        id: `bug_${String(i).padStart(3, '0')}`,
        title: bugTitles[i % bugTitles.length],
        description: randomElement(bugDescriptions),
        severity,
        status,
        reportedBy,
        assignedTo,
        gameId: Math.random() > 0.2 ? randomElement(games).id : null,
        createdAt: randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date()),
        updatedAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
      }
    })
  }

  console.log('Created 40 bug reports')

  // Create reports
  console.log('Creating reports...')
  await Promise.all([
    prisma.report.create({
      data: {
        id: 'report_001',
        title: 'Daily Player Activity Report',
        type: 'DAILY',
        format: 'PDF',
        generatedBy: manager.id,
        data: JSON.stringify({ 
          totalPlayers: 100, 
          activePlayers: 75, 
          newRegistrations: 12,
          averagePlayTime: 45
        }),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }),
    prisma.report.create({
      data: {
        id: 'report_002',
        title: 'Weekly Revenue Analysis',
        type: 'WEEKLY',
        format: 'CSV',
        generatedBy: admin.id,
        data: JSON.stringify({ 
          totalRevenue: 15000, 
          topGame: 'Realm of Legends',
          topItem: 'Battle Pass',
          averageOrderValue: 25.50
        }),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.report.create({
      data: {
        id: 'report_003',
        title: 'Monthly Bug Report Summary',
        type: 'MONTHLY',
        format: 'PDF',
        generatedBy: developer.id,
        data: JSON.stringify({ 
          openBugs: 15, 
          resolvedBugs: 25,
          criticalBugs: 3,
          averageResolutionTime: '2.5 days'
        }),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.report.create({
      data: {
        id: 'report_004',
        title: 'Server Performance Report',
        type: 'WEEKLY',
        format: 'PDF',
        generatedBy: admin.id,
        data: JSON.stringify({ 
          averageUptime: '99.5%',
          peakConcurrency: 4500,
          averageLatency: '45ms',
          incidentsCount: 2
        }),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.report.create({
      data: {
        id: 'report_005',
        title: 'Game Analytics Report',
        type: 'MONTHLY',
        format: 'CSV',
        generatedBy: manager.id,
        data: JSON.stringify({ 
          topGame: 'Battle Royale X',
          totalPlayHours: 500000,
          retentionRate: '68%',
          averageSession: '42 minutes'
        }),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    })
  ])

  console.log('Created 5 reports')

  console.log('\n✅ Seeding completed!')
  console.log('\n📋 Summary:')
  console.log('  - 3 Users (Admin, Developer, Manager)')
  console.log('  - 8 Games')
  console.log('  - 100 Players')
  console.log('  - 250 Purchases')
  console.log('  - 8 Servers')
  console.log('  - 40 Bug Reports')
  console.log('  - 5 Reports')
  console.log('\n🔑 Login Credentials:')
  console.log('  Admin: admin@videogame.com / admin123')
  console.log('  Developer: developer@videogame.com / dev123')
  console.log('  Manager: manager@videogame.com / manager123')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
