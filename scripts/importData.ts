// scripts/importData.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const raw = fs.readFileSync('data.json', 'utf-8');
  const data = JSON.parse(raw);

  for (const user of data) {
    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        createdAt: new Date(user.createdAt),

        settings: user.settings
          ? {
              create: {
                id: user.settings.id,
                activityType: user.settings.activityType,
                activityDetail: user.settings.activityDetail,
                goal: user.settings.goal,
                targetAudience: user.settings.targetAudience,
                preferredTone: user.settings.preferredTone,
              },
            }
          : undefined,

        facts: {
          create: user.facts.map((fact: any) => ({
            id: fact.id,
            text: fact.text,
            tags: fact.tags,
            createdAt: new Date(fact.createdAt),
            posts: fact.posts?.length
              ? {
                  create: fact.posts.map((post: any) => ({
                    id: post.id,
                    content: post.content,
                    version: post.version,
                    edited: post.edited,
                    isPosted: post.isPosted,
                    createdAt: new Date(post.createdAt),
                    userId: user.id, // これが重要！
                  })),
                }
              : undefined,
          })),
        },
      },
    });

    console.log(`✅ ユーザー作成: ${newUser.email}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ インポート失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });