const prisma = require('../../config/prisma');
const { GROUP_ROLES } = require('./groups.constants');

// ARYAN DE VIVA SHOWCASE: Atomic Transfer of Squad Ownership / Admin Promotion
async function transferSquadAdminRoleTransactional(groupId, currentAdminId, targetUserId) {
  return prisma.$transaction(async (tx) => {
    const currentAdminMembership = await tx.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: currentAdminId }
      }
    });

    if (!currentAdminMembership || currentAdminMembership.role !== GROUP_ROLES.ADMIN) {
      const error = new Error('Only the current squad admin can transfer leadership');
      error.statusCode = 403;
      throw error;
    }

    const targetMembership = await tx.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: targetUserId }
      }
    });

    if (!targetMembership) {
      const error = new Error('Target user is not a member of this friend squad');
      error.statusCode = 404;
      throw error;
    }

    // Demote current admin to regular MEMBER
    await tx.groupMember.update({
      where: { groupId_userId: { groupId, userId: currentAdminId } },
      data: { role: GROUP_ROLES.MEMBER }
    });

    // Promote target member to ADMIN
    const promotedMember = await tx.groupMember.update({
      where: { groupId_userId: { groupId, userId: targetUserId } },
      data: { role: GROUP_ROLES.ADMIN },
      include: {
        user: { select: { id: true, username: true } }
      }
    });

    return {
      success: true,
      newAdmin: promotedMember.user.username,
      groupId
    };
  });
}

module.exports = { transferSquadAdminRoleTransactional };
