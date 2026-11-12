async function requireGroupMember(req, res, next) {
  try {
    const groupId = req.params.id || req.params.groupId;
    const userId = req.user?.id;

    if (!groupId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'groupId parameter and authenticated user are required'
      });
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this friend squad.'
      });
    }

    req.groupMembership = membership;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireGroupMember };