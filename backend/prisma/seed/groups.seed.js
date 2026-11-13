
async function seedGroups(prisma, users, mediaItems) {
  const { krish, harsh, aryan } = users;

  // Clear existing groups to make seed idempotent
  await prisma.friendGroup.deleteMany({});

  const group = await prisma.friendGroup.create({
    data: {
      name: 'NST Weekend Watchers',
      inviteCode: 'NST202',
      description: 'Sci-Fi and Thriller squad for Friday night watch parties',
      members: {
        create: [
          { userId: krish.id, role: 'ADMIN' },
          { userId: harsh.id, role: 'MEMBER' },
          { userId: aryan.id, role: 'MEMBER' }
        ]
      }
    }
  });

  if (mediaItems.length >= 2) {
    const firstNomination = await prisma.groupWatchlistItem.create({
      data: {
        groupId: group.id,
        mediaId: mediaItems[0].id,
        addedById: krish.id,
        pitchNote: 'Matches all three of our Sci-Fi weights and streams on Netflix!',
        voteCount: 1,
        votes: {
          create: [{ userId: krish.id }]
        }
      }
    });

    await prisma.groupWatchlistItem.create({
      data: {
        groupId: group.id,
        mediaId: mediaItems[1].id,
        addedById: harsh.id,
        pitchNote: 'Mind-bending thriller for Saturday night.',
        voteCount: 1,
        votes: {
          create: [{ userId: harsh.id }]
        }
      }
    });

    return { group, firstNomination };
  }

  return { group };
}

module.exports = { seedGroups };
