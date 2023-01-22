﻿using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Followers;

public class FollowToggle
{
    public class Command : IRequest<Result<Unit>>
    {
        public string TargetUserName { get; set; }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
        private readonly DataContext _context;
        private readonly IUserAccessor _userAccessor;

        public Handler(DataContext context, IUserAccessor userAccessor)
        {
            _context = context;
            _userAccessor = userAccessor;
        }

        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            if (request.TargetUserName == _userAccessor.GetUserName())
                return null;

            var observer =
                await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUserName(),
                    cancellationToken);

            var target =
                await _context.Users.FirstOrDefaultAsync(x => x.UserName == request.TargetUserName, cancellationToken);

            if (target == null || observer == null) return null;

            var following = await _context.UserFollowings.FindAsync(observer.Id, target.Id, cancellationToken);

            if (following == null)
            {
                following = new UserFollowing
                {
                    ObserverId = observer.Id,
                    TargetId = target.Id
                };
                _context.UserFollowings.Add(following);
            }
            else
            {
                _context.UserFollowings.Remove(following);
            }

            var success = await _context.SaveChangesAsync(cancellationToken) > 0;

            if (success)
                return Result<Unit>.Success(Unit.Value);

            return Result<Unit>.Failure("Failed to update following");
        }
    }
}