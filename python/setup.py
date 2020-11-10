import setuptools

setuptools.setup(
    name="ossgui",
    version="0.1.0",
    author="Jeremy Magland",
    author_email="jmagland@flatironinstitute.org",
    packages=setuptools.find_packages(),
    scripts=[
        "bin/ossgui_start_server"
    ],
    install_requires=[
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
    ]
)
