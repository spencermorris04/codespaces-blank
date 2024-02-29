"use client";
import Link from 'next/link';
import { AppBar, Toolbar, IconButton, InputBase, Typography, Button } from '@mui/material';
import { Search as SearchIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import UploadComponent from './UploadButton';
import TextField from '@mui/material/TextField';
import UploadModalComponent from './UploadModal';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserPoints } from '../app/store/slices/pointsSlice'; // Adjust the path as needed
import { RootState, AppDispatch } from '../app/store/store';
import { useSpring, animated } from 'react-spring';
import PlaybackProgressDonut from './PlaybackProgressDonut';
import { createClient } from '~/util/supabase/client'; 

function classNames(...classes: Array<string | false | undefined | null>): string {
  return classes.filter(Boolean).join(' ');
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 1),
  },
  outline: '3px solid black',
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const TopNavbar = () => {
  const [user, setUser] = useState(null); // State to hold the user object
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [pointsDisplay, setPointsDisplay] = useState<number | string>('');
  const [lastPoints, setLastPoints] = useState<number>(0);

  // Fetch the user from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  // Get the total points from Redux store
  const totalPoints = useSelector((state: RootState) => state.points.totalPoints);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserPoints(user.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (totalPoints !== lastPoints) {
      setPointsDisplay(totalPoints);
      setLastPoints(totalPoints);
    }
  }, [totalPoints, lastPoints]);

  // Spring animation for the points
  const springProps = useSpring({ 
    number: totalPoints, 
    from: { number: lastPoints }
  });

  // Handle open/close for modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Modal style
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <AppBar position="static">
      <Toolbar className="bg-neo-red text-black flex justify-between">
                {/* Left-aligned items */}
                <div className="flex items-center">
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>



        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white outline outline-3 px-2 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              Options
              <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white outline outline-3 shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      )}
                    >
                      Songs
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      )}
                    >
                      Users
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      )}
                    >
                      Groups
                    </a>
                  )}
                </Menu.Item>
                <form method="POST" action="#">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full px-4 py-2 text-left text-sm'
                        )}
                      >
                        Genres
                      </button>
                    )}
                  </Menu.Item>
                </form>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        </div>




        {/* Right-aligned items */}
        <div className="flex items-center">
        <PlaybackProgressDonut />
          <div className="bg-white px-2 py-2 rounded-md outline outline-3 mr-4">
            
            <Typography variant="body1" color="inherit" component="div">
              Points: 
              <animated.span className="font-semibold text-black">
                {springProps.number.to(n => n.toFixed(0))}
              </animated.span>
            </Typography>
            
          </div>

          <div className="bg-white rounded-md outline outline-3 mr-4">
            <IconButton color="inherit" aria-label="notifications">
              <NotificationsIcon />
            </IconButton>
          </div>

          <div className="bg-white px-2 rounded-md outline outline-3">
            <Button color="inherit" onClick={handleOpen}>
              Upload
            </Button>
          </div>
        </div>

        {open && <UploadModalComponent onClose={handleClose} />}
      </Toolbar>
    </AppBar>
  );
};


export default TopNavbar;
