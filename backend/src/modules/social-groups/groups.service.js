const prisma = require('../../config/prisma');
const { generateInviteCode } = require('../../utils/inviteCode');
const { GROUP_ROLES } = require('./groups.constants');

async function createFriendGroup(userId, { name, description }) {
  let inviteCode = generateInviteCode(6);

  // Ensure generated invite code is unique
  const existing = await prisma.friendGroup.findUnique({ where: { inviteCode } });
  if (existing) {
    inviteCode = generateInviteCode(6);
  }

  return prisma.friendGroup.create({
    data: {
      name: name.trim(),
      description: description || '',
      inviteCode,
      members: {
        create: [
          {
            userId,
            role: GROUP_ROLES.ADMIN
          }
        ]
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, username: true }
          }
        }
      }
    }
  });
}

async function joinGroupByInviteCode(userId, rawInviteCode) {
  const inviteCode = rawInviteCode.trim().toUpperCase();

  const group = await prisma.friendGroup.findUnique({
    where: { inviteCode }
  });

  if (!group) {
    const error = new Error('No friend squad found with that invite code');
    error.statusCode = 404;
    throw error;
  }

  const existingMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId
      }
    }
  });

  if (existingMembership) {
    const error = new Error('You are already a member of this friend squad');
    error.statusCode = 409;
    throw error;
  }

  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId,
      role: GROUP_ROLES.MEMBER
    }
  });

  return group;
}

async function leaveFriendGroup(userId, groupId) {
  await prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    }
  });

  return { groupId, left: true };
}

module.exports = {
  createFriendGroup,
  joinGroupByInviteCode,
  leaveFriendGroup
};
